# Secure Camera Streaming Application

A secure camera streaming application that enables real-time encrypted transmission of camera feeds from a mobile device to a web interface. The application consists of a Flutter mobile app and a Next.js web interface with end-to-end encryption.

## Features

- **Real-time Camera Streaming**: Stream live camera feed from mobile device to web interface
- **End-to-End Encryption**: All data transmitted using AES-256 encryption
- **SHA-512 Authentication**: Secure PIN-based authentication between mobile and web
- **Remote Control**: Control flashlight and other camera features remotely
- **Cross-Platform Compatibility**: Works seamlessly between Flutter mobile and Next.js web
- **Secure Connection**: PIN-verified authentication before establishing connection

## Architecture

### Mobile App (Flutter)
- Built with Flutter framework for cross-platform compatibility
- Camera integration using the `camera` plugin
- Real-time streaming at ~12 FPS
- AES-256 encryption for all transmitted data
- SHA-512 based PIN authentication

### Web Interface (Next.js)
- Built with Next.js framework
- Real-time display of camera feed
- Command interface for remote control
- Secure API endpoints for data transmission

## Security Features

- **AES-256 Encryption**: All camera data encrypted before transmission
- **SHA-512 Authentication**: PIN-based verification between mobile and web
- **Secure Key Storage**: Encryption keys stored securely on device
- **Encrypted Command Transmission**: Remote commands encrypted before sending
- **Synchronized PIN Validation**: Both mobile and web must use matching PINs

## Installation & Setup

### Prerequisites
- Flutter SDK
- Node.js and npm
- Android Studio (for Android builds) or Xcode (for iOS builds)

### Mobile App Setup
1. Navigate to the Flutter project directory:
```bash
cd flutter/cameraapp
```

2. Install dependencies:
```bash
flutter pub get
```

3. Build the APK:
```bash
flutter build apk --release
```

### Web Interface Setup
1. Navigate to the Next.js project directory:
```bash
cd ../ # From flutter/cameraapp directory
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

### Web Interface
1. Access the web interface at `http://localhost:3000`
2. Enter a 4-digit PIN and click "Access"
3. Note the IP address displayed in the session details

### Mobile App
1. Launch the mobile application
2. Enter the same 4-digit PIN used on the web interface
3. Enter the IP address of the web server
4. Click "Connect to Camera"
5. Once connected, click "Start Streaming" to begin transmission

### Authentication Flow
1. User enters 4-digit PIN on web interface
2. User enters the same 4-digit PIN on mobile app
3. Mobile app validates PIN against web-stored PIN
4. Connection established only if PINs match
5. All subsequent data encrypted using AES-256

## Security Implementation

### Encryption
- **Algorithm**: AES-256 in CTR mode
- **Key Generation**: Derived from user PIN using SHA-512
- **IV Generation**: Random initialization vector for each transmission
- **Key Storage**: Secure device storage with key rotation support

### Authentication
- **PIN Verification**: Synchronized PIN validation between mobile and web
- **Connection Security**: All connections verified against stored PIN
- **Data Integrity**: SHA-512 checksums for data validation

## API Endpoints

### Camera API (`/api/camera`)
- `GET`: Retrieve latest camera frame
- `POST`: Register encryption keys or send encrypted data

### Command API (`/api/command`)
- `GET`: Poll for pending commands
- `POST`: Send remote commands (flashlight, etc.)

### Config API (`/api/config`)
- `GET`: Retrieve server configuration and session details

### PIN API (`/api/pin`)
- `POST`: Set the authentication PIN

## Troubleshooting

### Common Issues
- **Connection Failure**: Verify both PINs match and IP address is correct
- **Streaming Issues**: Check network connectivity and permissions
- **Camera Access**: Ensure camera permissions are granted to the app
- **Slow Performance**: May be affected by network speed or device capabilities

### Error Messages
- **"Invalid access key"**: PINs do not match between mobile and web
- **"Connection failed"**: Network issue or server unreachable
- **"PIN required"**: Authentication PIN not provided
- **"Server URL not set"**: Missing server connection information

## Development

### Mobile Development
- Use `flutter run` for development builds
- Hot reload enabled for faster iteration
- Debug mode provides additional logging

### Web Development
- Use `npm run dev` for development server
- Automatic reloading on code changes
- Console logging for debugging

## Deployment

### Mobile
- Build release APK using `flutter build apk --release`
- Sign APK for distribution
- Distribute through appropriate channels

### Web
- Build using `npm run build`
- Deploy to hosting platform of choice
- Configure domain and SSL as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## File Structure and Descriptions

### Mobile App (Flutter)
#### Core Components
- `lib/main.dart` - Main entry point of the Flutter application, initializes camera services and routing
- `lib/screens/login.dart` - Login screen with PIN and IP address inputs, includes validation and connection logic
- `lib/screens/camera.dart` - Main camera interface with streaming controls, flashlight toggle, and connection status
- `lib/widgets/connect_button.dart` - Custom widget for connection/disconnection button with visual feedback

#### Services
- `lib/services/cam.dart` - Camera service handling camera initialization, capture, and control
- `lib/services/conn.dart` - Connection service managing connection states and lifecycle
- `lib/services/sec_conn.dart` - Secure connection service handling encryption, key registration, and data transmission
- `lib/services/encryption_service.dart` - AES-256 encryption implementation with key derivation
- `lib/models/encrypted_data.dart` - Data model for encrypted transmissions with metadata

#### Utilities
- `lib/utils/security_utils.dart` - Security utility functions for hashing and key management
- `lib/services/key_rotation_service.dart` - Handles key rotation and versioning for enhanced security

### Web Interface (Next.js)
#### API Routes
- `app/api/camera/route.ts` - Handles camera feed transmission and encryption key registration
- `app/api/command/route.ts` - Manages remote command processing (flashlight, etc.)
- `app/api/config/route.ts` - Provides server configuration and session details
- `app/api/pin/route.ts` - Handles PIN storage and validation for authentication

#### Components
- `components/camera.tsx` - Main camera display component on the web interface
- `components/animated-login.tsx` - Animated login screen with PIN input and validation
- `components/media-sidebar.tsx` - Sidebar component showing session details and connection status

#### Libraries
- `lib/crypt.ts` - Cryptography utilities with AES-256 and SHA-512 implementations
- `lib/ks.ts` - Key storage management for encryption keys
- `lib/pin-storage.ts` - Persistent storage for authentication PINs
- `lib/utils.ts` - Utility functions shared across the web application

#### Styling and UI
- `components.json` - Configuration file for shadcn/ui components
- `app/globals.css` - Global styles and Tailwind CSS configuration
- `components/ui/` - Collection of reusable UI components (buttons, inputs, etc.)

### Configuration Files
- `package.json` - Project dependencies and scripts for the web interface
- `pubspec.yaml` - Flutter project configuration and dependencies
- `tsconfig.json` - TypeScript compiler configuration
- `next.config.mjs` - Next.js build configuration
- `postcss.config.mjs` - PostCSS configuration for CSS processing

### Scripts
- `build_apk.bat` - Batch script for building the Flutter APK
- `fix_connection.bat` - Utility script for connection troubleshooting

## Security Architecture

### Authentication System
- **PIN Synchronization**: Both web and mobile app must use the same 4-digit PIN
- **Server-Side PIN Storage**: The web interface stores the PIN in a temporary file (`temp-pin-storage.json`)
- **PIN Validation**: Mobile app sends its PIN during registration, which is validated against the web-stored PIN
- **Access Control**: Connections are rejected if PINs don't match exactly

### End-to-End Encryption
- **AES-256-CTR**: All camera data encrypted using Advanced Encryption Standard with 256-bit keys in Counter mode
- **Key Derivation**: Encryption keys derived from user PINs using SHA-512 hashing
- **Initialization Vector (IV)**: Random IV generated for each transmission to prevent pattern recognition
- **Secure Key Storage**: Keys stored securely on both devices using platform-specific secure storage

### Key Exchange Protocol
- **Key Registration**: Mobile app registers its encryption key with the web server during connection
- **Versioned Keys**: Keys are versioned to support key rotation and updates
- **Secure Transmission**: Keys are transmitted over encrypted channels with additional validation

### Data Transmission Security
- **Encrypted Payloads**: All camera frames and metadata encrypted before transmission
- **Metadata Protection**: Encrypted data includes version, IV, and timestamps
- **Integrity Checks**: SHA-512 hashes ensure data integrity during transmission
- **Secure Channels**: All communication happens over HTTP(S) with proper headers

### API-Level Security
- **Camera API (`/api/camera`)**: Validates PIN before accepting any data
- **Command API (`/api/command`)**: Requires active connection before processing commands
- **PIN API (`/api/pin`)**: Validates PIN format (4-digit numeric) before storing
- **Rate Limiting**: Prevents brute-force attacks on PIN validation

### Connection Security
- **Session Validation**: Connection status checked before processing any requests
- **Automatic Cleanup**: Connection automatically terminates when streaming stops
- **State Synchronization**: Both ends maintain synchronized connection states
- **Secure Disconnection**: Proper cleanup of encryption keys and connection handles

### Transport Security
- **Encrypted Communication**: All data transmitted in encrypted format
- **Secure Endpoints**: API endpoints validate authentication before processing
- **Header Security**: Uses appropriate headers to prevent certain attacks
- **Network Validation**: Validates server URLs and network connections

### Key Rotation and Management
- **Versioned Keys**: Supports multiple key versions for seamless updates
- **Secure Deletion**: Old keys properly removed from storage
- **Backup Mechanisms**: Key backup and recovery procedures
- **Rotation Policies**: Automatic key rotation based on time or usage

### Mobile-Specific Security
- **Platform Security**: Uses Flutter's secure storage mechanisms
- **Camera Permissions**: Proper permission handling for camera access
- **Background Processing**: Secure handling when app goes to background
- **Memory Protection**: Encryption keys not stored in plain text in memory

### Web Interface Security
- **Server-Side Storage**: PINs stored on server, not client-side
- **File-Based Persistence**: Temporary storage with proper file permissions
- **API Validation**: All endpoints validate authentication before processing
- **Session Management**: Tracks connection status and validates sessions

### Attack Prevention
- **Brute Force Protection**: Limits on PIN attempts and connection attempts
- **Format Validation**: Strict validation of input formats (IP, PIN, etc.)
- **Injection Prevention**: All inputs properly sanitized before processing
- **Timing Attacks**: Consistent response times to prevent timing-based attacks

### Error Handling Security
- **Secure Error Messages**: Error messages don't leak sensitive information
- **State Consistency**: Maintains secure state even during error conditions
- **Cleanup Procedures**: Proper cleanup on all error paths
- **Logging Security**: No sensitive data logged to insecure locations

This comprehensive security architecture ensures that the communication between the web interface and mobile app remains secure, authenticated, and protected against various attack vectors while maintaining the real-time streaming functionality.

## File Functions and Application Flow

### Mobile App (Flutter) Files

#### Core Application Files
- `lib/main.dart` - Initializes the Flutter app, sets up navigation routes, and starts the camera service
- `lib/screens/login.dart` - Handles user authentication with PIN and IP address input, validates credentials, manages connection attempts, and navigates to camera screen
- `lib/screens/camera.dart` - Main camera interface displaying live feed, controlling streaming, managing connection status, handling flashlight toggle, and displaying connection/streaming status
- `lib/widgets/connect_button.dart` - Custom widget that displays connection status and handles connect/disconnect functionality with visual feedback

#### Service Files
- `lib/services/cam.dart` - Manages camera initialization, controls camera settings, captures images, handles camera lifecycle, and provides camera controller access
- `lib/services/conn.dart` - Manages connection states (connected/disconnected), handles connection lifecycle events, and provides connection status
- `lib/services/sec_conn.dart` - Handles secure communication with server, encrypts data before transmission, registers encryption keys with server, sends encrypted data, fetches encrypted commands, and manages secure transmission protocols
- `lib/services/encryption_service.dart` - Implements AES-256 encryption algorithms, handles key derivation, manages IV generation, and provides cryptographic utilities
- `lib/models/encrypted_data.dart` - Defines data model for encrypted payloads including encrypted content, key version, encryption date, and IV

#### Utility Files
- `lib/utils/security_utils.dart` - Contains security-related utility functions for hashing, key generation, and security operations
- `lib/services/key_rotation_service.dart` - Manages encryption key rotation, handles key versioning, and maintains key lifecycle

### Web Interface (Next.js) Files

#### API Route Files
- `app/api/camera/route.ts` - Handles camera feed transmission, registers encryption keys from mobile app, validates PINs, processes encrypted data from mobile, decrypts and stores camera frames, and serves camera feed to web interface
- `app/api/command/route.ts` - Manages remote command processing, queues commands for mobile device, polls for pending commands, validates active connections, and handles command execution
- `app/api/config/route.ts` - Provides server configuration details, retrieves session information, detects local IP address, and returns connection status
- `app/api/pin/route.ts` - Handles PIN storage and validation, validates PIN format, and manages PIN lifecycle

#### Component Files
- `components/camera.tsx` - Displays camera feed on web interface, manages video playback, handles UI interactions, and provides visual feedback
- `components/animated-login.tsx` - Animated login screen with PIN input, validates PIN format, handles authentication, communicates with PIN API, and manages navigation to main interface
- `components/media-sidebar.tsx` - Sidebar component showing session details, connection information, and status updates

#### Library Files
- `lib/crypt.ts` - Implements cryptography utilities including AES-256 encryption/decryption, SHA-512 hashing, IV generation, and key derivation
- `lib/ks.ts` - Manages key storage for encryption keys on server-side
- `lib/pin-storage.ts` - Handles persistent storage for authentication PINs using file-based storage
- `lib/utils.ts` - Shared utility functions for both client and server

### Application Flow

#### Initialization Flow
1. **Mobile App Startup** (`lib/main.dart`):
   - App initializes and sets up routes
   - Camera service is initialized
   - Navigates to login screen

2. **Web Interface Startup** (`app/page.tsx`):
   - Page loads and initializes state
   - Fetches session details from config API
   - Shows login screen if not authenticated
   - Displays camera interface after authentication

#### Authentication Flow
1. **Web PIN Setup** (`components/animated-login.tsx` → `app/api/pin/route.ts`):
   - User enters 4-digit PIN on web interface
   - PIN is validated and sent to `/api/pin` endpoint
   - Server stores PIN in `temp-pin-storage.json`

2. **Mobile Connection** (`lib/screens/login.dart` → `app/api/camera/route.ts`):
   - User enters same 4-digit PIN and server IP on mobile
   - Mobile sends registration request with PIN to server
   - Server validates PIN against stored value
   - Connection established if PINs match

#### Streaming Flow
1. **Connection Establishment** (`lib/services/sec_conn.dart` → `app/api/camera/route.ts`):
   - Mobile registers encryption key with server
   - Server validates PIN and stores encryption key
   - Connection status updated on both ends

2. **Data Transmission** (`lib/screens/camera.dart` → `lib/services/sec_conn.dart` → `app/api/camera/route.ts`):
   - Camera captures frames at ~12 FPS when streaming active
   - Frames encrypted using AES-256 before transmission
   - Encrypted data sent to `/api/camera` endpoint
   - Server decrypts and stores frames
   - Web interface retrieves frames via GET requests

3. **Command Flow** (`app/api/command/route.ts` ↔ `lib/services/sec_conn.dart`):
   - Web interface sends commands to `/api/command` endpoint
   - Mobile polls for commands periodically
   - Commands executed on mobile device (e.g., flashlight toggle)

4. **Disconnection Flow** (`lib/screens/camera.dart`):
   - When streaming stops, automatic disconnection occurs
   - Resources are cleaned up
   - Connection status is updated

#### Security Flow
1. **PIN Validation**: All connections require matching PINs between web and mobile
2. **Key Registration**: Encryption keys are exchanged securely during connection
3. **Data Encryption**: All camera data encrypted before transmission
4. **Session Management**: Connection status tracked and validated on both ends
5. **Automatic Cleanup**: Resources released when streaming stops

This comprehensive flow ensures secure, authenticated communication between the mobile app and web interface while maintaining real-time streaming capabilities.

## Deployment to Vercel

### Why Vercel is Ideal for This Application
- Native Next.js support with optimized performance
- Better cold-start performance compared to other serverless platforms
- Built-in Git integration for automated deployments
- Global CDN for improved latency
- Zero-config setup for Next.js projects

### Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository with your project code
- Vercel CLI installed (optional): `npm i -g vercel`

### Deployment Steps

#### Option 1: Git Integration (Recommended)
1. **Prepare your repository**:
   - Ensure all code is committed to your Git repository
   - Verify that your `package.json` has the correct build script

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub/GitLab/Bitbucket repository
   - Vercel will automatically detect this is a Next.js project

3. **Configure build settings**:
   - Framework preset: Next.js (should be auto-detected)
   - Build command: `npm run build` (auto-detected)
   - Output directory: `.next` (auto-detected)
   - Install command: `npm install` (auto-detected)

4. **Environment Variables** (if needed):
   - If you modify the PIN storage to use environment variables, add them in Settings → Environment Variables
   - Example: `PIN_STORAGE_KEY=your_secret_key`

5. **Deploy**:
   - Click "Deploy" to start the first deployment
   - Vercel will automatically deploy on every Git push to main branch

#### Option 2: Command Line Deployment
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   cd /path/to/your/project
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new one
   - Confirm project settings
   - Deploy to production with `--prod` flag

### Important Considerations for This Application

#### PIN Storage on Vercel
- **Issue**: Serverless functions don't maintain state between requests
- **Current Solution**: In-memory storage using global variable (limited functionality)
- **Limitation**: PIN may be lost when serverless function instances change
- **Recommended Solutions**:
  1. **Vercel KV** (recommended):
     ```bash
     # Install @vercel/kv package
     npm install @vercel/kv
     ```
  
  2. **External Database**:
     - Supabase, PlanetScale, or MongoDB Atlas
     - Configure database connection in environment variables

  3. **Vercel Blob Storage** (for larger data):
     - For storing camera frames temporarily

#### Important Note for Vercel Deployment
Due to the current in-memory PIN storage implementation, the PIN may be reset when Vercel serverless functions restart. For production use, please consider upgrading to Vercel KV or an external database for persistent PIN storage.

#### Optimized Configuration
1. **Add Vercel configuration file** (`vercel.json`):
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 60
       }
     },
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           },
           {
             "key": "Access-Control-Allow-Methods",
             "value": "GET, POST, OPTIONS"
           },
           {
             "key": "Access-Control-Allow-Headers",
             "value": "Content-Type"
           }
         ]
       }
     ]
   }
   ```

2. **Update PIN storage for Vercel**:
   ```typescript
   // Example using Vercel KV
   import { kv } from '@vercel/kv';
   
   export async function getPin(): Promise<string | null> {
     return await kv.get('camera_pin');
   }
   
   export async function setPin(pin: string): Promise<void> {
     await kv.set('camera_pin', pin);
   }
   ```

### Post-Deployment Configuration
1. **Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Environment Variables**:
   - Project Settings → Environment Variables
   - Add any secrets needed for databases or external services

3. **Branch Deployments**:
   - Configure branch-specific deployments for testing
   - Usually deploys PR branches to preview URLs

### Mobile App Configuration
After deploying to Vercel:
1. **Get your Vercel URL**: Usually `https://your-project.vercel.app`
2. **Update mobile app connection**: Use your Vercel URL instead of localhost
3. **Example**: If your deployment URL is `https://secure-camera.vercel.app`, enter this as the server IP in the mobile app

### Monitoring and Logs
- Access logs and analytics in Vercel Dashboard
- Monitor performance metrics
- Set up alerts for errors or performance issues

### Cost Considerations
- **Free tier**: Suitable for personal use
- **Pro/Enterprise**: For production applications with higher usage
- **Request-based pricing**: Pay per serverless function execution
- **Bandwidth costs**: For camera stream data transmission

### Troubleshooting Common Issues
- **Cold start delays**: Optimize bundle size and consider keeping functions warm
- **File storage issues**: Always use external storage solutions
- **CORS errors**: Ensure proper headers are configured
- **Connection timeouts**: Increase function timeout limits if needed

This setup will give you a production-ready deployment of your secure camera streaming application on Vercel's optimized Next.js platform.
