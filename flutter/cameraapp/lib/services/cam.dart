import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';

class CameraService {
  CameraController? controller;
  final bool _isWeb = kIsWeb;

  Future<void> init(List<CameraDescription> cameras) async {
    if (_isWeb || cameras.isEmpty) {
      // On web or if no cameras available, we don't initialize
      return;
    }
    
    final camera = cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.back,
      orElse: () => cameras.first,
    );

    controller = CameraController(
      camera,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    await controller!.initialize();
  }

  void dispose() {
    if (!_isWeb) {
      controller?.dispose();
    }
  }
}
