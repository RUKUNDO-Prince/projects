"use strict";
CustomWiggle.create("letterWiggle", { wiggles: 3, type: "easeOut" });
var Color;
(function (Color) {
    Color["Red"] = "239, 83, 80";
    Color["Orange"] = "255, 160, 0";
    Color["Yellow"] = "253, 216, 53";
    Color["Green"] = "42, 252, 152";
    Color["Blue"] = "41, 121, 255";
    Color["Indigo"] = "57, 73, 171";
    Color["Violet"] = "103, 58, 183";
})(Color || (Color = {}));
const DOM = {
    get: (id) => {
        return document.getElementById(id);
    }
};
const KeyboardUtility = {
    createLetter: (value) => {
        return {
            time: new Date().getTime(),
            value
        };
    },
    getKeyID: (key) => {
        return `keyboard-key-${key}`;
    },
    validKey: (e) => {
        return (e.keyCode >= 65 && e.keyCode <= 90);
    }
};
const ColorUtility = {
    all: () => {
        return [
            Color.Red,
            Color.Orange,
            Color.Yellow,
            Color.Green,
            Color.Blue,
            Color.Indigo,
            Color.Violet
        ];
    }
};
const Letter = (props) => {
    const ref = React.useRef(null);
    const { state } = React.useContext(AppContext);
    React.useEffect(() => {
        const button = DOM.get(KeyboardUtility.getKeyID(props.value.toLowerCase()));
        if (button) {
            const rect = button.getBoundingClientRect();
            const left = `${rect.left}px`, top = `${rect.top}px`;
            const t1 = gsap.timeline();
            const colors = ColorUtility.all(), color = colors[state.count % colors.length];
            gsap.set(ref.current, {
                left,
                top
            });
            gsap.to(ref.current, {
                color: `rgb(${color})`,
                duration: 0.5,
                opacity: 1,
                scale: 4
            });
            const velocity = Math.min(900, gsap.utils.random(window.innerWidth * 0.4, window.innerWidth * 0.6, 1));
            gsap.to(ref.current, {
                duration: 2.5,
                physics2D: {
                    angle: "random(200, 300)",
                    gravity: window.innerHeight * 1.25,
                    velocity
                },
                rotation: "random(-360, 360)"
            });
            t1.to(button, {
                backgroundColor: `rgba(${color}, 0.25)`,
                borderColor: `rgb(${color})`,
                color: `rgb(${color})`,
                clearProps: "all",
                duration: 0.1,
                transform: "scale(0.9)",
            })
                .to(button, {
                duration: 0.25,
                ease: "letterWiggle",
                rotation: "random(-5, 5)"
            });
        }
    }, []);
    return (React.createElement("span", { ref: ref, className: "letter value" }, props.value));
};
const Letters = () => {
    const { state } = React.useContext(AppContext);
    const getLetters = () => {
        return state.letters.map((letter) => (React.createElement(Letter, { key: letter.time, time: letter.time, value: letter.value })));
    };
    return (React.createElement("div", { id: "letters" }, getLetters()));
};
const Keyboard = () => {
    const { addLetter } = React.useContext(AppContext);
    const getRows = () => {
        const rows = [
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
            ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
            ["z", "x", "c", "v", "b", "n", "m"]
        ];
        return rows.map((row, index) => {
            const rowClass = `keyboard-row-${index + 1}`;
            const keys = row.map((key) => {
                return (React.createElement("button", { key: key, type: "button", id: KeyboardUtility.getKeyID(key), className: "keyboard-key value", onClick: () => addLetter(KeyboardUtility.createLetter(key)) }, key));
            });
            return (React.createElement("div", { key: index, className: classNames("keyboard-row", rowClass) }, keys));
        });
    };
    return (React.createElement("div", { id: "keyboard-wrapper" },
        React.createElement("div", { id: "keyboard" }, getRows())));
};
const Counter = () => {
    const { state } = React.useContext(AppContext);
    React.useEffect(() => {
        const colors = ColorUtility.all(), color = colors[state.count % colors.length];
        gsap.fromTo("#counter-value", {
            scale: 1.25
        }, {
            clearProps: "all",
            duration: 0.25,
            scale: 1
        });
    }, [state.count]);
    return (React.createElement("div", { id: "counter" },
        React.createElement("h1", { id: "counter-value" }, state.count),
        React.createElement("h1", { id: "counter-label" }, "Score")));
};
const defaultAppState = () => ({
    count: 0,
    letters: []
});
const AppContext = React.createContext(null);
const App = () => {
    const [state, setStateTo] = React.useState(defaultAppState());
    const addLetter = (letter) => {
        setStateTo(Object.assign(Object.assign({}, state), { count: state.count + 1, letters: [...state.letters, letter] }));
    };
    const setLettersTo = (letters) => {
        setStateTo(Object.assign(Object.assign({}, state), { letters }));
    };
    const clearExpired = () => {
        const updated = state.letters.filter((letter) => new Date().getTime() - letter.time <= 2500);
        if (updated.length !== state.letters.length) {
            setLettersTo(updated);
        }
    };
    React.useEffect(() => {
        let index = 0;
        const word = "qwerty";
        const interval = setInterval(() => {
            const id = `keyboard-key-${word[index++]}`;
            DOM.get(id).click();
            if (index > word.length - 1) {
                clearInterval(interval);
            }
        }, 250);
    }, []);
    React.useEffect(() => {
        const handleOnKeyDown = (e) => {
            if (KeyboardUtility.validKey(e)) {
                addLetter(KeyboardUtility.createLetter(e.key));
            }
        };
        window.addEventListener("keydown", handleOnKeyDown);
        return () => {
            window.removeEventListener("keydown", handleOnKeyDown);
        };
    }, [state.letters]);
    React.useEffect(() => {
        clearExpired();
        const interval = setInterval(() => {
            clearExpired();
        }, 500);
        return () => clearInterval(interval);
    }, [state.letters]);
    return (React.createElement(AppContext.Provider, { value: { state, addLetter, setStateTo } },
        React.createElement("div", { id: "app" },
            React.createElement(Keyboard, null),
            React.createElement(Letters, null),
            React.createElement(Counter, null),
            React.createElement("a", { id: "youtube-link", href: "https://youtu.be/Hua8IhI7A4w", target: "_blank" },
                React.createElement("i", { className: "fa-brands fa-youtube" }),
                React.createElement("h1", null, "Tutorial")))));
};
ReactDOM.render(React.createElement(App, null), document.getElementById("root"));