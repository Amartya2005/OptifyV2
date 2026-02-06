import { render } from 'preact';
import { App } from './app';
import './styles/global.css'; // <--- THIS MUST BE HERE

render(<App />, document.getElementById('app'));