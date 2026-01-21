import 'dart:async';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import '../services/cam.dart';
import '../services/conn.dart';
import '../services/sec_conn.dart';
import '../widgets/connect_button.dart';

class Camera extends StatefulWidget {
  final List<CameraDescription> cameras;
  const Camera({super.key, required this.cameras});

  @override
  State<Camera> createState() => _CameraState();
}

class _CameraState extends State<Camera> {
  final CameraService _cameraService = CameraService();
  final ConnectionService _connectionService = ConnectionService();
  bool _loading = true;
  bool _isConnecting = false;
  String? _serverUrl;

  // Streaming state
  bool _isStreaming = false;
  Timer? _streamTimer;

  // Flashlight state
  bool _flashlightOn = false;
  Timer? _commandPollTimer;

  @override
  void initState() {
    super.initState();
    _startCamera();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) {
      _serverUrl = args;
    }
  }

  Future<void> _startCamera() async {
    try {
      await _cameraService.init(widget.cameras);

      if (!mounted) return;
      setState(() => _loading = false);
    } catch (e) {
// Camera initialization error handled silently
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _handleConnectionToggle() async {
    setState(() => _isConnecting = true);

    try {
      await _connectionService.toggleConnection();
      if (!mounted) return;

      final status = _connectionService.isConnected ? "Connected" : "Disconnected";

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(status),
          duration: const Duration(seconds: 2),
          backgroundColor: _connectionService.isConnected ? Colors.green : Colors.grey[800],
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Connection failed"),
          duration: Duration(seconds: 2),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isConnecting = false);
      }
    }
  }

  @override
  void dispose() {
    _streamTimer?.cancel();
    _commandPollTimer?.cancel();
    _cameraService.dispose();
    super.dispose();
  }

  /// Capture image and send securely to server
  Future<void> _captureAndSendSecureImage({bool silent = false}) async {
    if (_cameraService.controller == null) return;
    if (_serverUrl == null) {
        if (mounted && !silent) {
            ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Server URL not set. Please login again.'), backgroundColor: Colors.red),
            );
        }
        return;
    }

    try {
      // Check if camera is ready
      if (!_cameraService.controller!.value.isInitialized) {
        return;
      }

      // Capture the image
      final XFile image = await _cameraService.controller!.takePicture();

      // Read the image file as bytes
      final bytes = await image.readAsBytes();

      // Encrypt the image data before sending to server
      final encryptedData = await SecConn.encryptForServerTransmission(bytes);

      // Send the encrypted data to your server
      await _sendToServer(encryptedData);

      if (!silent) {
// Image sent successfully
        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Image captured and encrypted successfully'),
              backgroundColor: Colors.green,
              duration: Duration(milliseconds: 500),
            ),
          );
        }
      }
    } catch (e) {
// Error in capture process

      if (mounted && !silent) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 1),
          ),
        );
      }
    }
  }

  void _toggleStreaming() {
    setState(() {
      _isStreaming = !_isStreaming;
    });

    if (_isStreaming) {
      // Start streaming: capture every 80ms (~12 FPS) for smoother video
      _streamTimer = Timer.periodic(const Duration(milliseconds: 80), (timer) {
        _captureAndSendSecureImage(silent: true);
      });

      // Start command polling
      _startCommandPolling();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Live Stream Started'), backgroundColor: Colors.green),
      );
    } else {
      // Stop streaming
      _streamTimer?.cancel();
      _streamTimer = null;

      // Stop command polling
      _commandPollTimer?.cancel();
      _commandPollTimer = null;

      // Automatically disconnect when streaming stops
      _disconnectAutomatically();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Live Stream Stopped'), backgroundColor: Colors.orange),
      );
    }
  }

  /// Automatically disconnect when streaming stops
  Future<void> _disconnectAutomatically() async {
    if (_connectionService.isConnected) {
      try {
        await _connectionService.disconnect();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Disconnected automatically'),
              backgroundColor: Colors.grey,
              duration: Duration(seconds: 2),
            ),
          );
        }
      } catch (e) {
        // Silent fail - just ensure cleanup
      }
    }
  }

  /// Start polling for commands from the server
  void _startCommandPolling() {
    _commandPollTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      await _pollForCommands();
    });
  }

  /// Poll server for pending commands
  Future<void> _pollForCommands() async {
    if (_serverUrl == null) return;

    try {
      // Construct command URL (same base + /api/command)
      final uri = Uri.parse(_serverUrl!);
      final commandUrl = '${uri.scheme}://${uri.authority}/api/command';

      final commands = await SecConn.fetchCommands(commandUrl);

      if (commands != null && commands.isNotEmpty) {
        for (final command in commands) {
          await _executeCommand(command);
        }
      }
    } catch (e) {
// Command polling error
    }
  }

  /// Execute received command
  Future<void> _executeCommand(Map<String, dynamic> command) async {
    final action = command['action'] as String?;

    switch (action) {
      case 'toggle_flashlight':
        await _toggleFlashlight();
        break;
      default:
// Unknown command ignored
    }
  }

  /// Toggle flashlight on/off
  Future<void> _toggleFlashlight() async {
    if (_cameraService.controller == null) return;

    try {
      // Toggle the current state
      final newValue = !_flashlightOn;

      // Set the flashlight mode
      await _cameraService.controller!.setFlashMode(
        newValue ? FlashMode.torch : FlashMode.off
      );

      setState(() {
        _flashlightOn = newValue;
      });

// Flashlight state changed
    } catch (e) {
// Flashlight error
    }
  }

  /// Send encrypted data to the server
  Future<void> _sendToServer(dynamic encryptedData) async {
    if (_serverUrl == null) return;

    // encryptedData is of type EncryptedData
    await SecConn.sendData(_serverUrl!, encryptedData);
  }

  Widget _buildCameraPreview() {
    // Check if we have a camera controller and cameras are available
    if (_cameraService.controller != null &&
        _cameraService.controller!.value.isInitialized &&
        widget.cameras.isNotEmpty) {
      return CameraPreview(_cameraService.controller!);
    } else {
      // Display when camera unavailable
      return Container(
        color: Colors.grey[900],
        child: LayoutBuilder(
          builder: (context, constraints) {
            final iconSize = constraints.maxHeight * 0.15;
            final fontSizeLarge = constraints.maxHeight * 0.03;
            final fontSizeSmall = constraints.maxHeight * 0.02;

            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt_outlined,
                    size: iconSize > 80 ? 80 : iconSize,
                    color: Colors.grey,
                  ),
                  SizedBox(height: constraints.maxHeight * 0.03),
                  Text(
                    'Camera not available',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: fontSizeLarge > 18 ? 18 : fontSizeLarge,
                    ),
                  ),
                  SizedBox(height: constraints.maxHeight * 0.015),
                  Text(
                    'This feature works on mobile devices',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: fontSizeSmall > 14 ? 14 : fontSizeSmall,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Secure Camera'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Colors.white),
                  SizedBox(height: 20),
                  Text('Initializing camera...', style: TextStyle(color: Colors.white)),
                ],
              ),
            )
          : Column(
              children: [
                // Camera Preview
                Expanded(
                  child: Stack(
                    children: [
                      _buildCameraPreview(),
                      
                      // Top Status Bar
                      Positioned(
                        top: 10,
                        left: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Connection status
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: _connectionService.isConnected 
                                    ? Colors.green.withOpacity(0.3) 
                                    : Colors.red.withOpacity(0.3),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      _connectionService.isConnected
                                          ? Icons.wifi
                                          : Icons.wifi_off,
                                      size: 16,
                                      color: _connectionService.isConnected
                                        ? Colors.green
                                        : Colors.red,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      _connectionService.isConnected ? 'CONNECTED' : 'NOT CONNECTED',
                                      style: TextStyle(
                                        color: _connectionService.isConnected
                                          ? Colors.green
                                          : Colors.red,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Streaming status
                              if (_isStreaming)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.red.withOpacity(0.3),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: const BoxDecoration(
                                          color: Colors.red,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Text(
                                        'LIVE',
                                        style: TextStyle(
                                          color: Colors.red,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Controls Area
                Container(
                  height: 180,
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Main Action Buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          // Connect/Disconnect Button
                          Expanded(
                            flex: 2,
                            child: Container(
                              height: 50,
                              margin: const EdgeInsets.only(right: 10),
                              child: ConnectButton(
                                isConnected: _connectionService.isConnected,
                                isLoading: _isConnecting,
                                onPressed: _handleConnectionToggle,
                              ),
                            ),
                          ),

                          // Flashlight Button
                          Expanded(
                            child: Container(
                              height: 50,
                              child: ElevatedButton.icon(
                                onPressed: _connectionService.isConnected ? _toggleFlashlight : null,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _flashlightOn ? Colors.yellow[700] : Colors.grey[700],
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                icon: Icon(
                                  _flashlightOn ? Icons.flashlight_on : Icons.flashlight_off,
                                  color: Colors.white,
                                ),
                                label: const Text('Flash'),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 15),

                      // Stream Toggle Button
                      Container(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton.icon(
                          onPressed: _connectionService.isConnected ? _toggleStreaming : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isStreaming ? Colors.red : Colors.blue,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          icon: Icon(
                            _isStreaming ? Icons.stop : Icons.videocam,
                            size: 24,
                          ),
                          label: Text(
                            _isStreaming ? 'STOP STREAMING' : 'START STREAMING',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}