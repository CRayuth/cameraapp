import 'package:flutter/material.dart';
import '../services/sec_conn.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _keyController = TextEditingController();
  final TextEditingController _urlController = TextEditingController();
  String? _errorMessage;
  bool _isLoading = false;
  // static const String _validKey = '1234'; // Validation removed

  Future<void> _validateAndNavigate() async {
    final enteredKey = _keyController.text.trim();
    String enteredUrl = _urlController.text.trim();

    setState(() {
        _errorMessage = null;
    });

    if (enteredKey.length != 4 || !RegExp(r'^\d+$').hasMatch(enteredKey)) {
      setState(() => _errorMessage = 'Key must be exactly 4 digits');
      return;
    }

    if (enteredUrl.isEmpty) {
      setState(() => _errorMessage = 'Please enter the server IP');
      return;
    }

    // Validate IP address format
    if (!enteredUrl.startsWith(RegExp(r'^https?:\/\/|^[\d\.]+$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'))) {
      setState(() => _errorMessage = 'Please enter a valid IP address or URL');
      return;
    }

    // Auto-format IP to full URL if needed
    if (!enteredUrl.startsWith('http')) {
      // For local IPs, use port 3000 (e.g., 192.168.1.5 -> http://192.168.1.5:3000/api/camera)
      // For domains (like Vercel deployments), use https without port (e.g., myapp.vercel.app -> https://myapp.vercel.app/api/camera)
      if (enteredUrl.contains('.')) {
        // Likely a domain name or IP address
        if (enteredUrl.contains('vercel.app') || enteredUrl.contains('localhost') || enteredUrl.contains('192.168.') || enteredUrl.contains('10.')) {
          // For Vercel or localhost, use https without port
          enteredUrl = 'https://$enteredUrl/api/camera';
        } else {
          // For local network IPs, use http with port 3000
          enteredUrl = 'http://$enteredUrl:3000/api/camera';
        }
      } else {
        // Just an IP without dots - unlikely but default to local format
        enteredUrl = 'http://$enteredUrl:3000/api/camera';
      }
    }

    // Proceed with connection and validate access key
    setState(() => _isLoading = true);
    
    try {
      // Show the URL being used for debugging
      debugPrint('Attempting connection to: $enteredUrl');
          
      // Perform Handshake with PIN validation
      final success = await SecConn.registerKey(enteredUrl, pin: enteredKey);
    
      // Check if widget is still mounted before using context
      if (!mounted) return;
    
      if (success) {
        Navigator.pushNamed(
            context,
            '/camera',
            arguments: enteredUrl, // Pass full URL to camera screen
        );
      } else {
        setState(() => _errorMessage = 'Invalid access key or connection failed. Check IP/Network. Attempted URL: $enteredUrl');
      }
    } catch (e) {
      // Handle any exception during connection
      if (mounted) {
        setState(() => _errorMessage = 'Connection failed: ${e.toString()}. URL: $enteredUrl');
      }
    } finally {
      // Always stop loading indicator
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _keyController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A1A1A),
              Color(0xFF0F0F0F),
            ],
          ),
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isSmallScreen = constraints.maxWidth < 600;
            final padding = isSmallScreen ? 20.0 : 32.0;

            return Center(
              child: SingleChildScrollView(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: padding),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(height: 60),
                      // App logo/icon
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Colors.blue, Colors.purple],
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.camera_alt_outlined,
                          size: 40,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 30),
                      Text(
                        'Secure Camera',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: isSmallScreen ? 24.0 : 28.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Connect to your secure camera stream',
                        style: TextStyle(
                          color: Colors.grey[400],
                          fontSize: isSmallScreen ? 14.0 : 16.0,
                        ),
                      ),
                      const SizedBox(height: 40),
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.grey[900]?.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.grey[800]!,
                            width: 1,
                          ),
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            TextField(
                              controller: _keyController,
                              obscureText: true,
                              keyboardType: TextInputType.number,
                              maxLength: 4,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                              ),
                              decoration: InputDecoration(
                                hintText: '4-Digit Access Key',
                                hintStyle: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 16,
                                ),
                                counterText: "", // Hide character counter
                                filled: false,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(15),
                                  borderSide: BorderSide(
                                    color: Colors.grey[700]!,
                                    width: 1,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(15),
                                  borderSide: const BorderSide(
                                    color: Colors.blue,
                                    width: 2,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 24,
                                  vertical: 18,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            TextField(
                              controller: _urlController,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Server IP Address (e.g. 192.168.1.5)',
                                hintStyle: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                                filled: false,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(15),
                                  borderSide: BorderSide(
                                    color: Colors.grey[700]!,
                                    width: 1,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(15),
                                  borderSide: const BorderSide(
                                    color: Colors.blue,
                                    width: 2,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 16,
                                ),
                                errorText: _errorMessage,
                                errorStyle: const TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),
                      SizedBox(
                        width: double.infinity,
                        height: 55,
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Colors.blue, Colors.purple],
                            ),
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.blue.withValues(alpha: 0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _validateAndNavigate,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15),
                              ),
                              elevation: 0,
                            ),
                            child: _isLoading
                              ? SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: const AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : const Text(
                                  'Connect to Camera',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}