/*
User Summary
This allows users to choose their preferred mode, customize color settings for aesthetic or
logic-based purposes, and select camera behavior.

Technical Summary
This code configures properties and features of Loopy. It defines properties for Loopy mode (simple
or advanced), color logic mode, camera mode, and Side Bar options. The injectProperty function is
used to add these properties to the Loopy object. Additionally, HTML snippets are included to
display information and buttons in the Side Bar.
*/

// Loopy global features
/* injectProperty("loopy", "LoopyNode._UID",{
    defaultValue:0, // bool
    persist:0, // reserved
}); */

// Injects property: loopyMode (simple or advanced)
injectProperty('loopy', 'loopyMode', {
    defaultValue: 0,
    persist: 1,
    sideBar: {
        index: 1,
        options: [0, 1], // Simple || Advanced
        label: 'LOOPY v2 mode :',
        oninput: factorySwitchMode('simple', 'advanced'),
    },
});

// Injects property: colorLogic (Color Aesthetic or Color Logic)
injectProperty('loopy', 'colorLogic', {
    defaultValue: 0,
    persist: 2,
    sideBar: {
        index: 2,
        options: [0, 1],
        labelFunc: (v) => (v ? 'Color : significant for logic' : 'Color : only aesthetic'),
        advanced: true,
        oninput: factorySwitchMode('colorAestheticMode', 'colorLogicMode'),
    },
});

// Injects property: cameraMode (resize, follow signals, user controllable)
injectProperty('loopy', 'cameraMode', {
    defaultValue: 0,
    persist: 3,
    sideBar: {
        index: 3,
        options: [0, 1, 2],
        labelFunc: (v) => `Camera : ${[
            'resize to scene', // scene cam
            'follow signals', // signal cam
            'user controllable', // free cam
        ][v]}`,
        advanced: true,
    },
});
/* injectProperty("loopy", "embed",{
    defaultValue:0, // bool
    persist:3, // reserved
}); */

// Injects property: beforeAll (HTML snippet for the beginning of the sidebar) -> see examples, how to, credits
injectProperty('loopy', 'beforeAll', {
    sideBar: {
        index: 0,
        html: `<div class="globalLoopyFirstItem"></div><b style='font-size:1.4em'>LOOPY</b> (v2.0)
        <br>a tool for thinking in systems
        <br>
        <br><span class='mini_button' onclick='publish("modal",["examples"])'>see examples</span>
            <span class='mini_button' onclick='publish("modal",["howto"])'>how to</span>
            <span class='mini_button' onclick='publish("modal",["credits"])'>credits</span>
        <br><hr class="not_in_play_mode"/>`,
    },
});

// Injects property: afterAll (HTML snippet for the end of the sidebar)
// -> save as link, embed in your blog, save as file, load from file, json export, load from url, import extra file, make a GIF using LICEcap
injectProperty('loopy', 'afterAll', {
    sideBar: {
        index: 99,
        html: `<hr/>
        <span class='mini_button' onclick='publish("modal",["save_link"])'>save as link</span>
            <span class='mini_button' onclick='publish("modal",["embed"])' title="or website">embed in your blog</span>
        <br>
        <br><span class='mini_button' onclick='publish("export/file")'>save as file</span>
            <span class='mini_button' onclick='publish("load/file")'>load from file</span>
        <br>
        <div class="adv">
            <br><span class='mini_button' onclick='publish("export/json")'>json export</span>
                <span class='mini_button' onclick='publish("modal",["urlRemoteFile"])'>load from url</span>
            <br>
            <br><span class='mini_button' onclick='publish("import/file")'>import extra file</span>
            <br>
            <br><span class='mini_button' onclick='publish("modal",["save_gif"])'>make a GIF using LICEcap</span>
            <br>
        </div>
        <hr/>
        <div class="simpleOnly">
            <a target='_blank' href='../'>LOOPY</a> is made by <a target='_blank' href='http://ncase.me'>nicky case</a>
                with your support <a target='_blank' href='https://www.patreon.com/ncase'>on patreon</a> &lt;3
            <br>
            <br><span style='font-size:0.85em'>P.S: go read <a target='_blank' href='https://www.amazon.com/Thinking-Systems-Donella-H-Meadows/dp/1603580557'>Thinking In Systems</a>, thx</span>
            <br>
            <br>
        </div>
        LOOPY v2 reworked by <a target='_blank' style='font-size:0.90em' href='https://github.com/1000i100'>1000i100</a>
        <br>
        <br>Discover all the <a target='_blank' href='https://github.com/1000i100/loopy#changelog'>new features</a> :
        <br>- experiment advanced mode,
        <br>- click any <a href='javascript:publish("modal",["doc"])'>?</a> for tips & examples.
        <br>
        <br>Unleash your creativity !
        <br>
        <br>Had fun ? <span class='mini_button' onclick='publish(\"modal\",[\"save_link\"])'>Share it !</span>
        `,
    },
});

// Function to switch between simple and advanced mode
function factorySwitchMode(disabledClass, activatedClass) {
    return function (self, value) {
        let apply;
        if (value) {
            apply = function (page) {
                page.dom.classList.add(activatedClass);
                page.dom.classList.remove(disabledClass);
            };
        } else {
            apply = function (page) {
                page.dom.classList.add(disabledClass);
                page.dom.classList.remove(activatedClass);
            };
        }
        loopy.sidebar.pages.forEach(apply);
    };
}
