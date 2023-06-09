/** *************************************************************************************************
User Summary
This allows users to create and manipulate nodes. The nodes have various properties that determine
their appearance and behavior. The properties can be adjusted by the user.

Technical Summary
This code defines various properties for the LoopyNode class. The updateNodeSize function adjusts
the radius of the selected node based on its size. Properties such as id, x, y, label, hue, size,
init, overflow, underflow, aggregationLatency, explode, foreignColor, and interactive are injected
into the node class. These properties control aspects like the node's position, label, color, size,
initial fill, maximum and minimum fill, aggregation latency, explosion behavior, foreign color
signal handling, and interactivity options. The sideBar objects provide configuration options and
UI labels for each property.

************************************************************************************************** */

// LoopyNode features
function updateNodeSize(self, v) {
    // Adjust the radius based on the size of the selected node
    const selectedNode = self.page.target;
    if (selectedNode.size === 5) selectedNode.radius = 1.2 * LoopyNode.DEFAULT_RADIUS;
    if (selectedNode.size === 100) selectedNode.radius = 1.5 * LoopyNode.DEFAULT_RADIUS;
    if (selectedNode.size === 1) selectedNode.radius = LoopyNode.DEFAULT_RADIUS;
    if (selectedNode.size < 1) selectedNode.radius = 0.5 * LoopyNode.DEFAULT_RADIUS;
    if (!selectedNode.label) selectedNode.radius = 0.1 * LoopyNode.DEFAULT_RADIUS;
}

// Inject a property into the LoopyNode class
// Property: id
injectProperty('node', 'id', { persist: { index: 0, jsonOnly: true } });
// Property: x
injectProperty('node', 'x', { persist: { index: 1, binFunc: factoryRatioForXY(), serializeFunc: (v) => Math.round(v) } });
// Property: y
injectProperty('node', 'y', { persist: { index: 2, binFunc: factoryRatioForXY(), serializeFunc: (v) => Math.round(v) } });
/**
 * toggleable visibility in play mode (visible, hidden in play mode, hidden when dead)
 *
 * custom image url (to load an image for the circle
 *
 * borderless switch (if borderless, scale it up a bit and remove borders)
 */
// Property: label
injectProperty('node', 'label', {
    defaultValue: '?',
    immutableDefault: true,
    persist: {
        index: 4,
        jsonOnly: true, // string have special store in binary mode
        deserializeFunc: decodeURIComponent,
    },
    sideBar: {
        index: 1,
        label: 'Name :',
        oninput: updateNodeSize,
    },
});

// Property: hue
injectProperty('node', 'hue', {
    defaultValue: 0,
    persist: 5,
    sideBar: {
        index: 2,
        options: [0, 1, 2, 3, 4, 5],
        label: 'Color :',
    },
});

// Property: size
injectProperty('node', 'size', {
    defaultValue: 1,
    persist: 6,
    sideBar: {
        index: 3,
        options: [0.0001, 1, 5, 100],
        labelFunc: (v) => {
            const cases = [];
            cases[0.0001] = 'Size : tiny → boolean capacity';
            cases[1] = 'Size : normal → x1 capacity';
            cases[5] = 'Size : big → x5 capacity';
            cases[100] = 'Size : huge → x100 capacity';
            return cases[parseFloat(v)];
        },
        oninput: updateNodeSize,
        advanced: true,
    },
});

// Property: init (initial fill)
injectProperty('node', 'init', {
    defaultValue: 0.5,
    persist: 3,
    sideBar: {
        index: 4,
        options: [-1, 0, 0.25, 0.50, 0.75, 1],
        // options: [0, 1/6, 2/6, 3/6, 4/6, 5/6, 1],
        labelFunc: (v) => {
            const cases = [];
            cases[-1] = 'Dead';
            cases[0] = 'Empty';
            cases[0.25] = '25% filled';
            cases[0.5] = '50% filled';
            cases[0.75] = '75% filled';
            cases[1] = 'Full';
            return `${cases[parseInt(v)]} at start`;
        },
    },
});

// Property: capacity (maximum fill)
injectProperty('node', 'overflow', {
    defaultValue: 0,
    persist: 8,
    sideBar: {
        index: 5,
        options: [0, 0.16, 0.33, 0.50, 0.66, 0.83, 1],
        label: 'Overflow threshold :',
        advanced: true,
        combineWithNext: true,
        activeAtRight: true,
    },
});

// Property: underflow (minimum fill)
injectProperty('node', 'underflow', {
    defaultValue: 1,
    persist: 9,
    sideBar: {
        index: 6,
        options: [0, 0.16, 0.33, 0.50, 0.66, 0.83, 1],
        label: 'Negative overflow threshold :',
        advanced: true,
        activeAtLeft: true,
    },
});

// Property: aggregationLatency (time delay)
injectProperty('node', 'aggregationLatency', {
    defaultValue: 0,
    persist: 7,
    sideBar: {
        index: 7,
        options: [0, 0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4],
        labelFunc: (v) => `Aggregation latency : ${v ? `${v}s` : 'none'}`,
        advanced: true,
    },
});

// Property: explode (explode if full or empty) -> node dies
injectProperty('node', 'explode', {
    defaultValue: 0,
    persist: 10,
    sideBar: {
        index: 8,
        options: [0, -1, 1, 2],
        labelFunc: (v) => {
            const cases = [];
            cases[0] = 'Explode : never';
            cases[-1] = 'Explode : if empty';
            cases[1] = 'Explode : if full';
            cases[2] = 'Explode : if empty or full';
            return cases[parseInt(v)];
        },
        advanced: true,
    },
});

// Property: foreignColor (color of incoming signals is different)
injectProperty('node', 'foreignColor', {
    defaultValue: 0,
    persist: 11,
    sideBar: {
        index: 9,
        options: [0, 1],
        labelFunc: (v) => `Foreign color signal : ${v ? 'drop' : 'forward'}`, // delete, deny / transmit
        advanced: true,
        colorLogic: true,
    },
});

// Property: interactive (can the node be interacted with or just observed)
injectProperty('node', 'interactive', {
    defaultValue: 2,
    persist: 12,
    sideBar: {
        index: 10,
        options: [0, 1, 2, 3, 4],
        labelFunc: (v) => {
            const cases = [];
            cases[0] = 'Read-only node';
            cases[1] = 'User can send +';
            cases[2] = 'User can send +/-';
            cases[3] = 'User + & read-only when dead';
            cases[4] = 'User +/- & read-only when dead';
            return cases[parseInt(v)];
        },
        advanced: true,
    },
});
