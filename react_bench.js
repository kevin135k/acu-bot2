const React = require('react');
const ReactDOMServer = require('react-dom/server');

const MEDICINE_SYSTEMS = [
    {
        id: 'weiwang', title: '湯液藥精系統', icon: '🧑‍🍳', type: 'standard', leftAction: '補', rightAction: '瀉',
        data: {
            '心火': { pos: { x: 30, y: 20 }, element: '心火', left: '旋覆花7', right: '黃連2', color: 'bg-red-100 text-red-800 border-red-200' },
            '脾土': { pos: { x: 70, y: 20 }, element: '脾土', left: '人參10', right: '生薑5', color: 'bg-orange-100 text-orange-800 border-orange-200' },
            '肺金': { pos: { x: 82, y: 58 }, element: '肺金', left: '五味子9', right: '細辛4', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            '腎水': { pos: { x: 50, y: 85 }, element: '腎水', left: '地黃6', right: '茯苓1', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            '肝木': { pos: { x: 18, y: 58 }, element: '肝木', left: '桂枝8', right: '枳實3', color: 'bg-green-100 text-green-800 border-green-200' },
            '命門': { pos: { x: 50, y: 39 }, element: '命門', left: '乾薑2熟地7', right: '黃柏6肉桂1', color: 'bg-slate-100 text-slate-800 border-slate-200' }
        }
    }
];

function AppOld() {
    return React.createElement('div', null, MEDICINE_SYSTEMS.map(system => {
        return React.createElement('div', { key: system.id },
            Object.values(system.data).map((info, idx) => {
                return React.createElement('span', { key: idx }, info.element);
            })
        );
    }));
}

function AppNew() {
    return React.createElement('div', null, MEDICINE_SYSTEMS.map(system => {
        return React.createElement('div', { key: system.id },
            Object.keys(system.data).map((key) => {
                const info = system.data[key];
                return React.createElement('span', { key: key }, info.element);
            })
        );
    }));
}

console.time('Object.values with idx key render');
for (let i = 0; i < 20000; i++) {
    ReactDOMServer.renderToString(React.createElement(AppOld));
}
console.timeEnd('Object.values with idx key render');

console.time('Object.keys with string key render');
for (let i = 0; i < 20000; i++) {
    ReactDOMServer.renderToString(React.createElement(AppNew));
}
console.timeEnd('Object.keys with string key render');
