# Facebook Auto React

A Firefox extension that automatically reacts to Facebook posts with customizable reactions at regular intervals.

## Features

- 🔄 **Automatic Reactions**: Automatically likes or reacts to Facebook posts every 10 seconds
- 🎭 **Multiple Reaction Types**: Choose from Like, Love, Haha, Wow, Sad, or Angry reactions
- ▶️ **Start/Stop Control**: Easy toggle buttons to start or stop the auto-reacting process
- 📱 **Visual Feedback**: Clear visual indicators showing which posts have been reacted to
- ⚙️ **Customizable**: Select your preferred reaction type from the popup menu

## Installation

### From Firefox Add-ons (Coming Soon)
The extension will be available on Firefox Add-ons store soon.

### Manual Installation
1. Download or clone this repository
2. Open Firefox browser
3. Navigate to `about:debugging`
4. Click on "This Firefox"
5. Click "Load Temporary Add-on"
6. Select the `manifest.json` file from the extension folder

## Usage

1. Navigate to Facebook.com
2. Click on the extension icon in the Firefox toolbar
3. Select your preferred reaction type from the dropdown menu
4. Click the "Start" button to begin auto-reacting
5. Click the "Stop" button to pause the auto-reacting process

The extension will:
- Automatically react to posts every 10 seconds
- Scroll to the post that was just reacted to
- Show a green notification confirming each reaction
- Avoid reacting to the same post multiple times

## Privacy & Permissions

This extension:
- Only runs on Facebook domains (`*.facebook.com`)
- Does not collect or store any personal data
- Does not access your Facebook account information
- Works entirely in your browser locally

## Development

### Prerequisites
- Firefox browser
- Basic understanding of web extensions

### Structure
```
facebook-auto-react/
├── manifest.json
├── popup.html
├── popup.js
└── content.js
```

### Building
No build process required. The extension uses vanilla JavaScript.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **Important**: This extension is for educational purposes only. Please use responsibly and in accordance with Facebook's Terms of Service. The developer is not responsible for any consequences of using this extension.

⚠️ **Note**: While this extension automates reactions, it's designed to mimic human-like behavior. Excessive use may violate Facebook's policies.

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/Razor628x/Facebook-Auto-Like/issues) on GitHub.

## Author

[Razor628x](https://github.com/Razor628x)

## Repository

[https://github.com/Razor628x/Facebook-Auto-Like](https://github.com/Razor628x/Facebook-Auto-Like)
