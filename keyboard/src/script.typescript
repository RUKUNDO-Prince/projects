CustomWiggle.create("letterWiggle", { wiggles: 3, type: "easeOut" });

enum Color {
  Red = "239, 83, 80",
  Orange = "255, 160, 0",
  Yellow = "253, 216, 53",
  Green = "42, 252, 152",
  Blue = "41, 121, 255",
  Indigo = "57, 73, 171",
  Violet = "103, 58, 183"
}

interface ILetter {  
  time: number;
  value: string;
}

interface IDOMUtility {
  get: (id: string) => HTMLElement;
}

const DOM: IDOMUtility = {
  get: (id: string): HTMLElement => {
    return document.getElementById(id);
  }
}

interface IKeyboardUtility {
  createLetter: (value: string) => ILetter;
  getKeyID: (key: string) => string;
  validKey: (e: any) => boolean;
}

const KeyboardUtility: IKeyboardUtility = {
  createLetter: (value: string): ILetter => {
    return {
      time: new Date().getTime(),
      value
    }
  },
  getKeyID: (key: string): string => {
    return `keyboard-key-${key}`;
  },
  validKey: (e: any): boolean => {
    return (e.keyCode >= 65 && e.keyCode <= 90);
  }
}

interface IColorUtility {
  all: () => Color[];
}

const ColorUtility: IColorUtility = {
  all: (): Color[] => {
    return [
      Color.Red,
      Color.Orange,
      Color.Yellow,
      Color.Green,
      Color.Blue,
      Color.Indigo,
      Color.Violet
    ]
  }
}

interface ILetterProps {  
  time: number;
  value: string;
}

const Letter: React.FC<ILetterProps> = (props: ILetterProps) => {
  const ref: React.MutableRefObject<HTMLSpanElement> = React.useRef<HTMLSpanElement>(null);
  
  const { state } = React.useContext(AppContext);
  
  React.useEffect(() => {    
    const button: HTMLButtonElement = DOM.get(KeyboardUtility.getKeyID(props.value.toLowerCase()));
    
    if(button) {
      const rect: DOMRect = button.getBoundingClientRect();
      
      const left: string = `${rect.left}px`,
            top: string = `${rect.top}px`;
      
      const t1 = gsap.timeline();
      
      const colors: Color[] = ColorUtility.all(),
            color: Color = colors[state.count % colors.length];
      
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
      
      const velocity: number = Math.min(900, gsap.utils.random(window.innerWidth * 0.4, window.innerWidth * 0.6, 1));
      
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
  
  return (
    <span ref={ref} className="letter value">{props.value}</span>
  );
}

const Letters: React.FC = () => {  
  const { state } = React.useContext(AppContext);
  
  const getLetters = (): JSX.Element[] => {
    return state.letters.map((letter: ILetter) => (
      <Letter         
        key={letter.time}
        time={letter.time} 
        value={letter.value} 
      />
    ));
  }

  return (
    <div id="letters">
      {getLetters()}  
    </div>
  )
}

const Keyboard: React.FC = () => {
  const { addLetter } = React.useContext(AppContext);
  
  const getRows = (): JSX.Element[] => {
    const rows: string[][] = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"]
    ];
    
    return rows.map((row: string[], index: number) => {
      const rowClass: string = `keyboard-row-${index + 1}`;

      const keys: JSX.Element[] = row.map((key: string) => {   
        return (
          <button 
            key={key}
            type="button"  
            id={KeyboardUtility.getKeyID(key)}                                         
            className="keyboard-key value"
            onClick={() => addLetter(KeyboardUtility.createLetter(key))}
          >
            {key}
          </button>
        );
      });

      return (
        <div key={index} className={classNames("keyboard-row", rowClass)}>
          {keys}
        </div>
      );
    });
  }
  
  return (
    <div id="keyboard-wrapper">
      <div id="keyboard">
        {getRows()}
      </div>
    </div>
  );
}

const Counter: React.FC = () => {
  const { state } = React.useContext(AppContext);
  
  React.useEffect(() => {
    const colors: Color[] = ColorUtility.all(),
          color: Color = colors[state.count % colors.length];
    
    gsap.fromTo("#counter-value", {
      scale: 1.25
    }, {
      clearProps: "all",
      duration: 0.25,
      scale: 1
    });
  }, [state.count]);
  
  return (
    <div id="counter">
      <h1 id="counter-value">{state.count}</h1>
      <h1 id="counter-label">Score</h1>
    </div>
  );
}

interface IAppState {
  count: number;
  letters: ILetter[];
}

const defaultAppState = (): IAppState => ({
  count: 0,
  letters: []
});

interface IAppContext {
  state: IAppState;
  addLetter: (letter: ILetter) => void;
  setStateTo: (state: IAppState) => void;
}

const AppContext = React.createContext<IAppContext>(null);

const App: React.FC = () => {
  const [state, setStateTo] = React.useState<IAppState>(defaultAppState());
  
  const addLetter = (letter: ILetter): void => {
    setStateTo({ 
      ...state, 
      count: state.count + 1,
      letters: [...state.letters, letter]      
    });
  }
  
  const setLettersTo = (letters: ILetter[]): void => {
    setStateTo({ ...state, letters });
  }
  
  const clearExpired = (): void => {
    const updated: ILetter[] = state.letters.filter((letter: ILetter) => new Date().getTime() - letter.time <= 2500);
      
    if(updated.length !== state.letters.length) {
      setLettersTo(updated);
    }
  }
  
  React.useEffect(() => {
    let index: number = 0;

    const word: string = "qwerty";

    const interval: NodeJS.Timeout = setInterval(() => {
      const id: string = `keyboard-key-${word[index++]}`

      DOM.get(id).click();

      if(index > word.length - 1) {
        clearInterval(interval);
      }
    }, 250);      
  }, []);
  
  React.useEffect(() => {
    const handleOnKeyDown = (e: any): void => {
      if(KeyboardUtility.validKey(e)) {
        addLetter(KeyboardUtility.createLetter(e.key));
      }
    }
    
    window.addEventListener("keydown", handleOnKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleOnKeyDown);
    }
  }, [state.letters]);
  
  React.useEffect(() => {
    clearExpired();
    
    const interval: NodeJS.Timeout = setInterval(() => {
      clearExpired();
    }, 500);
    
    return () => clearInterval(interval);
  }, [state.letters]);
  
  return (
    <AppContext.Provider value={{ state, addLetter, setStateTo }}>
      <div id="app">
        <Keyboard />
        <Letters />
        <Counter />
        <a id="youtube-link" href="https://youtu.be/Hua8IhI7A4w" target="_blank">
          <i className="fa-brands fa-youtube" />
          <h1>Tutorial</h1>
        </a>
      </div>
    </AppContext.Provider>
  );
}

ReactDOM.render(<App/>, document.getElementById("root"));