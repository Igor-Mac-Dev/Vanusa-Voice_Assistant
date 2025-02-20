### [🟡🟢Versão BR🟢🟡](https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/blob/main/README_PT.md)

# Vanusa - Voice Assistant

### Version 0.0.1

Vanusa is a powerful and customizable voice assistant that was designed to work
as a 24/7 secretary, and to do so it integrates with Node-RED to enable advanced
automations. Whether controlling devices, processing commands, or interacting
with complex systems, Vanusa offers a natural, voice-based interface to handle
your personal or professional automation needs.

The program includes native and customizable voice commands, with the option to
add new commands or modify existing ones. All this runs in the background on
your computer, with a graphical interface to customize settings.

## 📌 Key Features

-  Speech-to-text conversion using powerful APIs (Picovoice, Whisper).
-  Voice response with text-to-audio conversion.
-  Full customization via graphical interface.
-  Voice command support integrated with Node-RED.
-  Language support: Portuguese (PT-BR) and English (EN).

## 🗣 Voice Commands

Vanusa recognizes the following commands that can be processed internally or
sent to Node-RED:

-  **Turn off**: Turns off the voice assistant.
-  **Red**: Opens Node-RED.
-  **Cancel**: Cancels the current request.
-  **Repeat**: Repeats the last response.
-  **Repeat last**: Repeats the previous response.
-  **Config**: Opens the graphical interface for settings.
-  **Explain**: Opens a notepad where the user can paste text for voice
   explanation.
-  **Translate**: Opens a notepad for pasting text to be translated and spoken.
-  **Create_audio**: Opens a notepad to receive text and generate audio.
-  **Transcribe**: Composed command > Records your voice and generates a file
   containing what you said in text.
-  **Code**: Composed command > Listens to your request and generates a file
   with the corresponding code.

(generated files will be saved in the "documments\Vanusa-files" folder)

## 🔧 Installation

To install and run Vanusa:

1. <a href="https://raw.githubusercontent.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/refs/heads/main/Vanusa_installer.cmd" download>Click
   here</a> to download the installer, then run it as admin. (The installer
   needs to restart your PC to finish the installation. To avoid this you can
   install git manually.)
2. Open the application and customize the settings via the graphical interface.
   When satisfied, press "Save and Start."
3. The update and the uninstaller scripts will be available in 'C:\Vanusa'
   folder.

## 🛠️ Customizable Settings

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

## 🚀 Running the Assistant

Once installed and configured, Vanusa runs in the background, waiting for your
keyword to activate and ready to answer your questions or process commands.

### Usage Flow

#### 🎙️ Idle Mode

Vanusa waits for the activation keyword; at this stage, it also responds to the
"Repeat" and "repeat last" commands.

-  Deefault activation keyword: "Vanusa" in PT-BR, "Scarlett" in EN.

#### 🎙️ Input Mode

Vanusa records what is said until the user stops speaking, the defined time
limit is reached, or a specific command is recognized (commands are only
recognized if said alone; for example, "Explain" will only be recognized if
spoken by itself).

#### 🎙️ Waiting Mode

Vanusa generates and plays the response or executes the command. During this
stage, the program does not accept new inputs until the response has finished
playing, but it does recognize the "Cancel" command. After this, it returns to
Idle Mode, and the cycle repeats.

## 🦏 Commands Customization

In the Picovoice console, you can create your own keywords, voice commands, and
custom vocabularies for the STT engines. You can replace the .ppn keyword files
in the "vanusa\assets\models" folder with those you’ve created, keeping the same
file names. For commands (.rhn), you don’t need to replace existing files,
simply add the files in the "vanusa\assets\models\Rhino" folder of your
language. Vanusa recognizes the commands and sends
[objects with instructions](https://www.youtube.com/watch?v=IPC_pCT9r1o&t=157s)
(`{intent: ..., slots: {...}}`) to Node-RED, where you can manually automate
actions triggered by your custom commands.

### Node Red Flows

Implementing an existing flow with Vanusa is as easy as dragging them to it, or
using web sockets to connect them. If you made a cool flow to use with your
assistant, you can also share it with the community. I suggest
[Node-RED's official page](https://flows.nodered.org/search?type=flow) to find
and share them. Explain the command's format and inform if your flow is meant to
be used with Vanusa if that's the case so other people can use it.

#### Node Red port

If you want to set a different port for Node-RED, you can do it by editing the
ecosystem.config.cjs file and changing the value of the args: "... -p _new port_
" in the 'V-node-red' object.

### Composite Commands

Picovoice's intent detector can't understand anything that wasn't explicitly
programmed, so I've added a feature to make composite commands. That is, a
command that can be made with words/numbers not previously programmed in
Picovoice's console. To use them, you can follow two paths:

1. Just add a "C\_" prefix to your .rhn file (like in
   .\assets\models\Rhino\en\C_Code_en_windows_v3_0_0.rhn), so when you call the
   command, Vanusa will play the
   [command beep](https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/blob/main/assets/beeps/cmd.wav)
   and listen normally. Once you stop talking, that will add a transcription
   property to the cmd.slots object, with the raw transcription of what was
   said.
2. Also, add a file to the "vanusa\assets\templates" folder, named the same as
   the command's intent, followed by an underscore and the language's code, like
   in "Code_en.txt". That file must contain a JSON-like template, so that it
   will be sent to the completion API, where the response will be formatted as
   an object by the AI and then merged with the cmd.slots object.

## 🧠 Local LLM

Vanusa doesn't implement a local LLM because most people can't afford this as I
do, but if you want to do so feel free to change the .\src\OpenAI\completion.ts
file to do so. As long as the module keeps the _not explicit but there_ current
interface, receiving a string and returning the completion, it should work fine.

## 🐧 Linux Version

I tried to make Vanusa run with PM2 for better compatibility, but it didn't work
well as long as PM2 spawns shell prompts without any kind of mercy in Windows,
so I decided to migrate it to run as a process in Windows. While I don't make
it, Vanusa is being released with PM2, so I can use the already working
configurations furthermore to easily run it on Linux. For now, the program
should not run directly on Linux, mostly because of some Windows-specific codes
like the power monitor functionality and the Picovoice files, which are
OS-specific and have download limits.

## 💻 Support and Contributions

This project is in its initial version (0.0.1). Feedback and contributions are
welcome! If you encounter any issues or have suggestions, feel free to open an
issue or submit a pull request.

**License**: This project is licensed under the AGPL-3.0. **Terms of use**:
[Here](https://github.com/Igor-Mac-Dev/Vanusa-Voice_Assistant/blob/main/TERMS.md).
