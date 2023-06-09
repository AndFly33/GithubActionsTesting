/** *************************************************************************************************
User Summary
The Play Controls are at the bottom of the screen and allows the user to click play to switch from
edit mode to play mode. Once in play mode the user can interact with two new buttons that were
added: Stop button exits play mode and switch to edit mode, Reset button resets the canvas to
default values before user interacted with the nodes. A speed slider is added below the two buttons
and controls the speed of the animations.

Technical Summary
The PlayControls function is used to to create the elements using the PlayButton and PlaySlider
functions and add it to the page. The PlayButton function creates the html and styles for the
buttons. The Playslider function creates the html and styles for the slider and uses the domSpeedImg
function to create the slider icons.

************************************************************************************************** */

function PlayControls(loopy) {
    const self = this;
    PageUI.call(self, document.getElementById('playbar'));

    self.loopy = loopy;

    // PAGES & BUTTONS

    // PLAY BUTTON's keyboard shortcut
    // TODO: Toggle back & forth??????
    subscribe('key/enter', () => {
        if (Key.control) { // Ctrl-Enter or ⌘-Enter
            loopy.setMode(Loopy.MODE_PLAY);
        }
    });

    // During the Editor
    (function () {
        const page = new Page();

        // PLAY BUTTON
        const buttonDOM = page.addComponent(new PlayButton({
            icon: 0,
            label: 'Play',
            tooltip: isMacLike ? '⌘-Enter' : 'control-enter',
            onclick() {
                loopy.setMode(Loopy.MODE_PLAY);
                // self.showPage("Edit");
            },
        })).dom;
        buttonDOM.setAttribute('big', 'yes');
        buttonDOM.style.fontSize = '28px';
        buttonDOM.style.height = '35px';

        self.addPage('Editor', page);
    }());

    // During the Play Mode adds buttons like stop, reset, speed slider.
    (function () {
        const page = new Page();
        const _addButton = function (side, config) {
            const buttonDOM = page.addComponent(new PlayButton(config)).dom;
            buttonDOM.style.width = '100px';
            buttonDOM.style[side] = '0px';
            buttonDOM.style.top = '0px';
        };

        // If embedded in another site shows different control buttons when in play mode.
        // Example: Click "embed in your blog" from the sidebar
        if (loopy.embedded) {
            // Reset | Remix
            _addButton('left', { label: 'Reset', icon: 2, onclick: () => publish('model/reset') });
            _addButton('right', { label: 'Remix', icon: 3, onclick: () => window.open(loopy.saveToURL(), '_blank') });
        } else {
            // Stop | Reset
            _addButton('left', { label: 'Stop', icon: 1, onclick: () => loopy.setMode(Loopy.MODE_EDIT) });
            _addButton('right', { label: 'Reset', icon: 2, onclick: () => publish('model/reset') });
        }

        // SPEED SLIDER
        const speedSlider = page.addComponent(new PlaySlider({
            value: loopy.signalSpeed,
            min: 0,
            max: 6,
            step: 0.2,
            oninput(value) {
                loopy.signalSpeed = value;
            },
        })).dom;
        speedSlider.style.bottom = '0px';

        self.addPage('Player', page);
    }());
}
// Creates the play button
function PlayButton(config) {
    const self = this;

    const label = `<div class='play_button_icon' icon='${config.icon}'></div> `
				+ `<div class='play_button_label'>${config.label}</div>`;

    self.dom = _createButton(label, () => {
        config.onclick();
    });

    // Tooltip!
    if (config.tooltip) {
        self.dom.setAttribute('data-balloon', config.tooltip);
        self.dom.setAttribute('data-balloon-pos', 'top');
    }
}
// Creates the speed slider
function PlaySlider(config) {
    const self = this;
    self.dom = document.createElement('div');
    self.dom.style.bottom = '0px';
    self.dom.style.position = 'absolute';
    self.dom.style.width = '100%';
    self.dom.style.height = '20px';

    // Input
    const input = document.createElement('input');
    input.setAttribute('class', 'play_slider');
    self.dom.appendChild(input);

    // Slow & Fast Icons
    self.dom.appendChild(domSpeedImg('css/icons/speed_slow.png', 'left'));
    self.dom.appendChild(domSpeedImg('css/icons/speed_fast.png', 'right'));

    // Properties
    input.type = 'range';
    input.value = config.value;
    input.step = config.step;
    input.min = config.min;
    input.max = config.max;
    input.oninput = function () { // (event)
        config.oninput(input.value);
    };
}
// Creates image elements for the dom.
// Used for Slow and Fast icons for speed slider
function domSpeedImg(src, side) {
    const img = new Image();
    img.src = src;
    img.width = 20;
    img.height = 15;
    img.style.position = 'absolute';
    img.style[side] = '5px';
    img.style.top = '-2px';
    return img;
}
