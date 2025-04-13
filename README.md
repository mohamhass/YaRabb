# YaRabb - Muslim Dua Assistant

YaRabb is a mobile application designed to help Muslims make dua (supplication) by providing access to Allah's 99 beautiful names and authentic duas from the Quran and Sunnah.

## Features

- **Dua Assistant**: Enter your dua intention and get personalized recommendations
- **Allah's 99 Names**: Browse and search through the beautiful names of Allah
- **Authentic Duas**: Access authentic duas from the Quran and Sunnah
- **On-Device AI**: Private and secure processing that works without an internet connection
- **Clean UI**: Modern, soft interface designed for spiritual content

## Technical Details

- Built with React Native and Expo
- TypeScript for type safety
- On-device AI powered by TensorFlow.js
- Focused on iOS deployment first, with Android support planned

## Setup Instructions

1. Ensure you have Node.js and npm installed
2. Install Expo CLI: `npm install -g expo-cli`
3. Clone this repository
4. Navigate to the project directory: `cd YaRabbApp`
5. Install dependencies: `npm install`
6. Start the development server: `npm start`

## Extending the App

### Adding More Names of Allah

Edit the `src/data/allahNames.ts` file to add more names with their meanings and benefits.

### Adding More Duas

Edit the `src/data/authenticDuas.ts` file to add more authentic duas from reliable sources.

### Adding Hadiths

A future update will include hadith integration. The structure will be similar to the duas data format.

## Publishing to iOS App Store

1. Build the app for production: `expo build:ios`
2. Follow Expo's instructions to submit to the App Store
3. Update the bundle identifier in `app.json` with your actual identifier

## License

[Your License Here]

## Credits

Created by [Your Name]