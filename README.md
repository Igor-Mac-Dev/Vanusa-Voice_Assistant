Aqui está a tradução para o inglês da versão final:

---

# Vanusa - Voice Assistant

### Version 0.0.1

Vanusa is a powerful and customizable voice assistant that integrates with
Node-RED to enable advanced automations. Whether controlling devices, processing
commands, or interacting with complex systems, Vanusa offers a natural,
voice-based interface to streamline your personal or professional automation
needs. The program includes native and customizable voice commands, with the
option to add new commands or modify existing ones. All this runs discreetly in
the background on your computer, with a graphical interface to customize
settings like language, speech sensitivity, text-to-speech (TTS) engines, and
speech recognition (STT). Available in English and Portuguese, Vanusa activates
with a keyword, simplifying your daily tasks with powerful commands and
automations.

## 📌 Key Features

-  Speech-to-text conversion using powerful APIs (OpenAI, Picovoice, Whisper).
-  Voice response with text-to-audio conversion.
-  Full customization via graphical interface.
-  Voice command support with immediate actions or integration with Node-RED.
-  Language support: Portuguese (PT-BR) and English (EN).
-  Keyword activation: "Vanusa" in PT-BR, "Lilian" in EN.

## 🔧 Installation

To install and run Vanusa:

1. [Click here](https://github.com/Igor-Mac-Dev/teste/blob/main/installer.cmd)
   to download the installer.
2. Open the application and customize the settings via the graphical interface.
   When satisfied, press "Save and Start."

## 🚀 Running the Assistant

Once installed and configured, Vanusa runs in the background, waiting for your
keyword to activate and ready to answer your questions or process commands.

### Usage Flow

The program runs in the background, so it’s essential to follow the correct
voice command flow:

#### Idle Mode

Vanusa waits for the activation keyword; at this stage, it also responds to the
"Repeat" command.

#### Input Mode

Vanusa records what is said until the user stops speaking, the defined time
limit is reached, or a specific command is recognized (commands are only
recognized if said alone; for example, "Explain" will only be recognized if
spoken by itself).

#### Waiting Mode

Vanusa generates and plays the response or executes the command. During this
stage, the program does not accept new inputs until the response has finished
playing, but it does recognize the "Cancel" command. After this, it returns to
Idle Mode, and the cycle repeats.

## 🗣 Voice Commands

Vanusa recognizes a range of commands that can be processed directly or sent to
Node-RED:

### Commands processed by the assistant:

-  **Turn off**: Turns off the voice assistant.
-  **Red**: Opens Node-RED.
-  **Cancel**: Cancels the current request.
-  **Repeat**: Repeats the last response.
-  **Repeat last**: Repeats the previous response.
-  **Config**: Opens the graphical interface for settings.

### Commands sent to Node-RED:

-  **Explain**: Opens a notepad where the user can paste text for voice
   explanation.
-  **Translate**: Opens a notepad for pasting text to be translated and spoken.
-  **Code**: Requests a specific code to be processed.

## 🎛 Customizable Settings

Access the graphical interface to configure the assistant according to your
preferences:

-  Assistant language
-  Start with PC: choose if the program should start automatically when your
   computer turns on.
-  Recording time
-  Microphone selection
-  Speech recognition sensitivity
-  Silence time to end input recording
-  Speech recognition engines (STT): Whisper or Picovoice
-  Text-to-speech engines (TTS): Google, Picovoice, or OpenAI
-  Picovoice API key
-  GPT chat model
-  Assistant specifications: adjust the assistant’s virtual behavior
-  Message history: set the size of the history log
-  GPT temperature: adjust the model's creativity
-  Maximum tokens: set the response token limit for GPT
-  OpenAI API key

> "For those who don’t know where they want to go, any path will do." Feel free
> to use the program’s default settings, but don’t forget to add your API keys.

### Customization:

In the Picovoice console, you can create your own keywords, voice commands, and
custom vocabularies for the STT engines. Replace the files in the "Assets"
folder with those you’ve created, keeping the same filenames. For commands
(Rhino), you don’t need to replace existing files; simply add the files in the
folder for your language. Vanusa recognizes the commands and sends objects with
instructions (`{intent: ~, [slot: ~, ...]}`) to Node-RED, where you can manually
automate actions triggered by your custom commands.

## 💻 Support and Contributions

This project is in its initial version (0.0.1). Feedback and contributions are
welcome! If you encounter any issues or have suggestions, feel free to open an
issue or submit a pull request.

**License**: This project is licensed under the AGPL-3.0.
