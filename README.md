# Novation Launchpad Emulator

This is a rudimentary emulator of the Novation Launchpad.

It uses the web MIDI API to communicate with other hardware and
software devices.  You will be prompted to approve access when first
using the emulator.

It automatically connects itself to all available MIDI inputs and
outputs on your system once MIDI access is approved.  A menu for
connecting / disconnecting devices is on the TODO list.

## Acknowledgments

The code to draw the Launchpad on screen was inspired by
[Olivier Croisier's LP4J project](https://github.com/OlivierCroisier/LP4J).
I wrote my own implementation to handle button values differently, but it's
pretty clear I had LP4J code fresh on my mind when I wrote my function.
