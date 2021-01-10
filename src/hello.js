import Vodka from './vodka';

export default Vodka.define('hello', class extends Vodka {
  constructor() {
    super();
  }

  template() {
    this.html`
        <div class="hello">
            Hello world !
        </div>
    `;
  }
});