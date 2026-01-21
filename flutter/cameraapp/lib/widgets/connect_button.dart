import 'package:flutter/material.dart';

class ConnectButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isConnected;
  final bool isLoading;

  const ConnectButton({
    super.key,
    required this.onPressed,
    required this.isConnected,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isSmallScreen = constraints.maxWidth < 600;
        final fontSize = isSmallScreen ? 14.0 : 16.0;
        final padding = EdgeInsets.symmetric(
          horizontal: isSmallScreen ? 24.0 : 36.0,
          vertical: isSmallScreen ? 10.0 : 14.0,
        );

        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isConnected
                ? [Colors.green.shade700, Colors.green.shade900]
                : [Colors.grey.shade700, Colors.grey.shade900],
            ),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: isConnected
                  ? Colors.green.withValues(alpha: 0.3)
                  : Colors.grey.withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: isLoading ? null : onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              foregroundColor: Colors.white,
              padding: padding,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              elevation: 0,
            ),
            child: isLoading
                ? SizedBox(
                    width: isSmallScreen ? 16 : 20,
                    height: isSmallScreen ? 16 : 20,
                    child: CircularProgressIndicator(
                      strokeWidth: isSmallScreen ? 1.5 : 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isConnected ? Colors.white : Colors.black,
                      ),
                    ),
                  )
                : Text(
                    isConnected ? "Disconnect" : "Connect",
                    style: TextStyle(
                      fontSize: fontSize,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
          ),
        );
      },
    );
  }
}
