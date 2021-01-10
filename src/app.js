import Vodka from './vodka.js';

class App extends Vodka {
  constructor() {
    // debugger;
    super();
    
    // Static vars (do not updateComponent on change)
    this.myStaticTitle = 'Vodka Usage Examples';

    // State vars (do updateComponent on change )
    this.state.timer = 0;
    this.state.counter = 0;
    this.state.mytext = 'Write something ... ';

    // Event listeners
    this.events = {
      click: {
        '#increment': (e) => {
          this.state.counter++;
        },
        '#reset': (e) => {
          this.state.mytext = 'Text has been reset !';
        },
      },
    };
    
    setInterval(() => {
      this.state.timer++;
    }, 5000);
  }

  template() {
    this.html`
        <div class="examples">
            <h1>${'>>'} ${this.myStaticTitle}</h1>
            <hr/>
            <div class="timer">
                5sec TIMER : ${() => this.state.timer} (initial value = ${this.state.timer})
            </div>
            <hr/>
            <div class="incrementor">
                COUNTER : ${() => this.state.counter * 100}
                <button id="increment">Increment !</button>
            </div>
            <hr/>
            <div class="inline-text">
                TWO WAYS BIND: <input data-bind="mytext">
                ${() => this.state.mytext}
                <button id="reset">Reset !</button>
            </div>
        </div>
    `;
  }
}

window.customElements.define('my-app', App);
