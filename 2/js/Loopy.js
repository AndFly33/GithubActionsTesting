/** ************************************************************************************************
User Summary
This code is the base class of the simulation upon which the rest of the code is built. It contains
the base functionality for edit and play modes, saving or loading a Loopy file, and displaying the
simulation.

Technical Summary
The code defines constants for the modes edit and play, as well as the tools ink, drag, erase, and
label. The Loopy class comprises the main portion of the file. It initializes the window, mouse,
model, sidebar, mode (play/edit), and the toolbar. The functions update and draw contain code for
the visuals. Loopy additionally contains code for running play and edit modes, saving and loading
files, handling model changes and importing/exporting, and dealing with embedded mode.

************************************************************************************************* */

function Loopy(config) {
    // Constants to determine if the simulation is in play or edit mode
    Loopy.MODE_EDIT = 0;
    Loopy.MODE_PLAY = 1;

    // Constants to determine what tool to use when in edit mode
    Loopy.TOOL_INK = 0;
    Loopy.TOOL_DRAG = 1;
    Loopy.TOOL_ERASE = 2;
    Loopy.TOOL_LABEL = 3;

    Loopy._CLASS_ = 'Loopy';

    // Initialize default properties
    const self = this;
    window.loopy = self;
    self.config = config;
    injectedDefaultProps(self, objTypeToTypeIndex('loopy'));

    // Loopy: EMBED???
    self.embedded = _getParameterByName('embed');
    self.embedded = !!parseInt(self.embedded); // force to Boolean

    // Offset & Scale?!?!
    self.offsetX = 0;
    self.offsetY = 0;
    self.offsetScale = 1;

    // Mouse
    Mouse.init(document.getElementById('canvasses')); // TODO: ugly fix, ew

    // Model
    self.model = new Model(self);

    // Loopy: SPEED!
    self.signalSpeed = 3;

    // Sidebar
    self.sidebar = new Sidebar(self);
    self.sidebar.showPage('Edit'); // start here

    // Play/Edit mode
    self.mode = Loopy.MODE_EDIT;

    // Tools
    self.toolbar = new Toolbar(self);
    self.tool = Loopy.TOOL_INK;
    self.ink = new Ink(self);
    self.drag = new Dragger(self);
    self.erase = new Eraser(self);
    self.label = new Labeller(self);

    // Modal
    self.modal = new Modal(self);

    /// ///////
    // INIT //
    /// ///////

    self.init = function () {
        self.loadFromURL(); // try it.
    };

    /// ////////////////
    // UPDATE & DRAW //
    /// ////////////////

    // Update Mouse at 30 fps
    self.update = function () {
        Mouse.update();
        if (self.wobbleControls >= 0) self.wobbleControls -= 1; // wobble
        if (!self.modal.isShowing) { // modAl
            self.model.update(); // modEl
        }
    };
    setInterval(self.update, 1000 / 30); // 30 FPS, why not.

    // Draw function for modal (sidebar information) and model (screen itself)
    self.draw = function () {
        if (!self.modal.isShowing) { // modAl
            self.model.draw(); // modEl
        }
        requestAnimationFrame(self.draw);
    };

    // TODO: Smarter drawing of Ink, Edges, and Nodes
    // (only Nodes need redrawing often. And only in PLAY mode.)

    /// ///////////////////
    // PLAY & EDIT MODE //
    /// ///////////////////

    self.showPlayTutorial = false;
    self.wobbleControls = -1;
    self.setMode = function (mode) {
        self.mode = mode;
        publish('loopy/mode');

        // Play mode!
        if (mode === Loopy.MODE_PLAY) {
            self.model.olderOffset = false; // Camera Reset
            self.showPlayTutorial = true; // show once
            if (!self.embedded) self.wobbleControls = 45; // only if NOT embedded
            self.sidebar.showPage('Edit');
            self.playbar.showPage('Player');
            self.sidebar.dom.setAttribute('mode', 'play');
            self.toolbar.dom.setAttribute('mode', 'play');
            document.getElementById('canvasses').removeAttribute('cursor'); // TODO: EVENT BASED

            // Activate autoplay nodes by sending a signal to them
            const autoplayNodes = loopy.model.nodes.filter((n) => n.label === 'autoplay' || n.label === 'autostart');
            for (const node of autoplayNodes) {
                node.takeSignal({
                    delta: 0.33,
                    color: node.hue,
                });
            }
            // Reset model if not in play mode
        } else {
            publish('model/reset');
        }

        // Edit mode!
        if (mode === Loopy.MODE_EDIT) {
            self.showPlayTutorial = false; // Stop showing tutorial
            self.wobbleControls = -1; // Disable wobble controls

            // configure sidebar and playbard for edit mode
            self.sidebar.showPage('Edit');
            self.playbar.showPage('Editor');
            self.sidebar.dom.setAttribute('mode', 'edit');
            self.toolbar.dom.setAttribute('mode', 'edit');
            document.getElementById('canvasses').setAttribute('cursor', self.toolbar.currentTool); // TODO: EVENT BASED
        }
    };

    /// //////////////
    // SAVE & LOAD //
    /// //////////////

    self.dirty = false;

    // Dirty: unsaved changes
    subscribe('model/changed', () => {
        if (!self.embedded) self.dirty = true;
    });

    // Export model as binary file
    subscribe('export/file', () => {
        const element = document.createElement('a');
        element.setAttribute('href', `data:application/octet-stream;base64,${binToB64(serializeToBinary())}`);
        element.setAttribute('download', 'system_model.loopy');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    });
    // Export model as json file
    subscribe('export/json', () => {
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${serializeToHumanReadableJson()}`);
        element.setAttribute('download', 'system_model.loopy.json');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    });

    // Load/import model from a file
    function importFileHandler(mergeWithCurrent) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            // noinspection JSUnresolvedVariable
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (readerEvent) => loopy.model.importModel(deserializeFromArrayBuffer(readerEvent.target.result), mergeWithCurrent);
        };
        input.click();
    }

    subscribe('load/file', () => importFileHandler(false));
    subscribe('import/file', () => importFileHandler(true));

    // Create a URL for model
    self.saveToURL = function (embed) {
        // Create link
        const uri = serializeToUrl(embed);
        const base = window.location.origin + window.location.pathname;
        let historyLink = `${base}?${uri}`;

        // NO LONGER DIRTY!
        self.dirty = false;

        // PUSH TO HISTORY
        try {
            window.history.replaceState(null, null, historyLink);
        } catch (e) {
            window.location.hash = uri;
            historyLink = `${base}#${uri}`;
        }

        return historyLink;
    };

    // "BLANK START" DATA:
    // const _blankData = "[[[1,403,223,1,%22something%22,4],[2,405,382,1,%22something%2520else%22,5]],[[2,1,94,-1,0],[1,2,89,1,0]],[[609,311,%22need%2520ideas%2520on%2520what%2520to%250Asimulate%253F%2520how%2520about%253A%250A%250A%25E3%2583%25BBtechnology%250A%25E3%2583%25BBenvironment%250A%25E3%2583%25BBeconomics%250A%25E3%2583%25BBbusiness%250A%25E3%2583%25BBpolitics%250A%25E3%2583%25BBculture%250A%25E3%2583%25BBpsychology%250A%250Aor%2520better%2520yet%252C%2520a%250A*combination*%2520of%250Athose%2520systems.%250Ahappy%2520modeling!%22]],2%5D";
    const _blankData = '[[[1,403,223,1,%22something%22,4],[2,405,382,1,%22something%2520else%22,5]],[[2,1,94,-1,0],[1,2,89,1,0]],2%5D';

    // Create a model from a URL
    self.loadFromURL = function () {
        const remoteDataUrl = _getParameterByName('url');
        if (remoteDataUrl) {
            fetch(remoteDataUrl).then((r) => r.arrayBuffer()).then((aB) => loopy.model.importModel(deserializeFromArrayBuffer(aB)));
        } else {
            let data = _getParameterByName('data');
            if (!data) data = window.location.href.split('?')[1];
            if (!data) data = window.location.href.split('#')[1];
            if (!data) data = decodeURIComponent(_blankData);
            loopy.model.importModel(deserializeFromUrl(data));
        }
    };

    /// ////////////////////////
    /// ///// EMBEDDED? ////////
    /// ////////////////////////

    self.init();

    // Play Controls
    self.playbar = new PlayControls(self);
    self.playbar.showPage('Editor'); // start here

    // Check if embedded mode is enabled
    if (self.embedded) {
        // Hide UI elements
        self.toolbar.dom.style.display = 'none';
        self.sidebar.dom.style.display = 'none';
        document.getElementById('sidebarSwitch').style.display = 'none';

        // If *NO UI AT ALL*
        const noUI = !!parseInt(_getParameterByName('no_ui')); // force to Boolean
        if (noUI) {
            _PADDING_BOTTOM = _PADDING;
            self.playbar.dom.style.display = 'none';
        }

        // Fullscreen canvas
        document.getElementById('canvasses').setAttribute('fullscreen', 'yes');
        self.playbar.dom.setAttribute('fullscreen', 'yes');
        publish('resize');

        // Center & SCALE The Model
        self.model.center(true);
        subscribe('resize', () => {
            self.model.center(true);
        });

        // Autoplay!
        self.setMode(Loopy.MODE_PLAY);

        // Also, HACK: auto signal
        let signal = _getParameterByName('signal');
        if (signal) {
            signal = JSON.parse(signal);
            const node = self.model.getNode(signal[0]);
            node.takeSignal({
                delta: signal[1] * 0.33,
                color: node.hue,
            });
        }
    }

    // NOT DIRTY, THANKS
    self.dirty = false;

    // SHOW ME, THANKS
    document.body.style.opacity = '';

    // GO.
    requestAnimationFrame(self.draw);
}
