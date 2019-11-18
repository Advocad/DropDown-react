import React from 'react';
import Multiselect from './multiselect/index';

class App extends React.Component {
  state = {
    plainArray: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
    objectArray: [
      { key: 'Option 1', cat: 'Group 1' },
      { key: 'Option 2', cat: 'Group 1' },
      { key: 'Option 3', cat: 'Group 1' },
      { key: 'Option 4', cat: 'Group 2' },
      { key: 'Option 5', cat: 'Group 2' },
      { key: 'Option 6', cat: 'Group 2' },
      { key: 'Option 7', cat: 'Group 2' },
    ],
  };

  render() {
    const { plainArray, objectArray } = this.state;

    return (
      <div className="block">
        <h2>Массив данных</h2>
        <Multiselect options={plainArray} isObject={false} />
        <h2>Объект данных</h2>
        <Multiselect options={objectArray} displayValue="key" />
      </div>
    );
  }
}

export default App;
