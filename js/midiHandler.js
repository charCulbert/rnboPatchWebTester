class MIDIHandler {
    constructor() {
        this.midiInputs = new Map();
        this.device = null;
        this.context = null;
    }

    setDevice(device) {
        this.device = device;
        this.context = device.context;
    }

    async initialize() {
        try {
            const access = await navigator.requestMIDIAccess();
            
            this.midiInputs.clear();
            
            access.inputs.forEach((input, key) => {
                input.onmidimessage = (ev) => this.handleMIDIMessage(ev);
                this.midiInputs.set(key, input);
            });

            access.onstatechange = (e) => {
                if (e.port.type === 'input') {
                    if (e.port.state === 'connected') {
                        e.port.onmidimessage = (ev) => this.handleMIDIMessage(ev);
                        this.midiInputs.set(e.port.id, e.port);
                    } else {
                        this.midiInputs.delete(e.port.id);
                    }
                }
            };

            return {
                success: true,
                message: `MIDI enabled: ${this.midiInputs.size} input(s) connected`
            };
        } catch (err) {
            return {
                success: false,
                message: 'MIDI not available'
            };
        }
    }

    handleMIDIMessage(ev) {
        if (!this.device) return;
        
        const midiEvent = new RNBO.MIDIEvent(
            this.context.currentTime * 1000,
            0,
            ev.data
        );
        this.device.scheduleEvent(midiEvent);
    }
}

window.midiHandler = new MIDIHandler();