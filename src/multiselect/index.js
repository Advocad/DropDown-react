import React, { Component } from 'react';
import style from './style.css';

class Multiselect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      options: props.options,
      filteredOptions: props.options,
      unfilteredOptions: props.options,
      selectedValues: Object.assign([], props.selectedValues),
      preSelectedValues: Object.assign([], props.selectedValues),
      toggleOptionsList: false,
      highlightOption: 0,
			showCheckbox: props.showCheckbox,
      groupedObject: [],
    };
		this.searchWrapper = React.createRef();
		this.searchBox = React.createRef();
  }

  componentDidMount() {
    const { showCheckbox, groupBy } = this.props;
    const { options } = this.state;
    if (!showCheckbox) {
      this.removeSelectedValuesFromOptions(false);
    }
    if (groupBy && showCheckbox) {
      this.groupByOptions(options);
    }
    this.searchWrapper.current.addEventListener('click', this.listenerCallback);
  }

  listenerCallback = () => {
    this.searchBox.current.focus();
  }

  componentWillUnmount() {
    this.searchWrapper.current.removeEventListener('click', this.listenerCallback);
  }

  removeSelectedValuesFromOptions = (skipCheck) => {
    const { isObject, displayValue, groupBy } = this.props;
    const { selectedValues = [], unfilteredOptions, options } = this.state;
    if (!skipCheck && groupBy) {
      this.groupByOptions(options);
    }
    if (!selectedValues.length && !skipCheck) {
      return;
    }
    if (isObject) {
      const optionList = unfilteredOptions.filter((item) => (selectedValues.findIndex(
        (v) => v[displayValue] === item[displayValue],
      ) === -1));
      if (groupBy) {
        this.groupByOptions(optionList);
      }
      this.setState(
        { options: optionList, filteredOptions: optionList },
        this.filterOptionsByInput,
      );
      return;
    }
    const optionList = unfilteredOptions.filter(
      (item) => selectedValues.indexOf(item) === -1,
    );

    this.setState(
      { options: optionList, filteredOptions: optionList },
      this.filterOptionsByInput,
    );
  }

  groupByOptions = (options) => {
    const { groupBy } = this.props;
    const groupedObject = options.reduce((r, a) => {
      const key = a[groupBy] || 'Others';
      r[key] = r[key] || [];
      r[key].push(a);
      return r;
    }, Object.create({}));

    this.setState({ groupedObject });
  }

  onChange(event) {
    this.setState(
      { inputValue: event.target.value },
      this.filterOptionsByInput,
    );
  }

  filterOptionsByInput = () => {
    let { options, filteredOptions, inputValue } = this.state;
    const { isObject, displayValue } = this.props;
    if (isObject) {
      options = filteredOptions.filter(
        (i) => i[displayValue].indexOf(inputValue) > -1,
      );
    } else {
      options = filteredOptions.filter((i) => i.indexOf(inputValue) > -1);
    }
    this.groupByOptions(options);
    this.setState({ options });
  }

  onArrowKeyNavigation = (e) => {
    const {
      options,
      highlightOption,
      toggleOptionsList,
      inputValue,
      selectedValues,
    } = this.state;
    if (e.keyCode === 8 && !inputValue && selectedValues.length) {
      this.onRemoveSelectedItem(selectedValues.length - 1);
    }
    if (e.keyCode === 27 && !inputValue && selectedValues.length) {
      this.onRemoveItems();
    }

    if (!options.length) {
      return;
    }
    if (e.keyCode === 38) {
      if (highlightOption > 0) {
        this.setState((previousState) => ({
          highlightOption: previousState.highlightOption - 1,
        }));
      } else {
        this.setState({ highlightOption: options.length - 1 });
      }
    } else if (e.keyCode === 40) {
      if (highlightOption < options.length - 1) {
        this.setState((previousState) => ({
          highlightOption: previousState.highlightOption + 1,
        }));
      } else {
        this.setState({ highlightOption: 0 });
      }
    } else if (e.key === 'Enter' && options.length && toggleOptionsList) {
      this.onSelectItem(options[highlightOption]);
    }
    setTimeout(() => {
      const element = document.querySelector('ul.optionContainer .highlight');
      if (element) {
        element.scrollIntoView();
      }
    });
  }

  onRemoveItems = () => {
    const { selectedValues } = this.state;
    selectedValues.splice(0);
    this.setState({ selectedValues }, () => {
      this.removeSelectedValuesFromOptions(true);
    });
  }

  onRemoveSelectedItem = (item) => {
    let {
      selectedValues, showCheckbox, index = 0, isObject,
    } = this.state;
    const { onRemove, displayValue } = this.props;
    if (isObject) {
      index = selectedValues.findIndex(
        (i) => i[displayValue] === item[displayValue],
      );
    } else {
      index = selectedValues.indexOf(item);
    }
    selectedValues.splice(index, 1);
    onRemove(selectedValues, item);
    this.setState({ selectedValues }, () => {
      if (!showCheckbox) {
        this.removeSelectedValuesFromOptions(true);
      }
    });
  }

  onSelectItem = (item) => {
    const { selectedValues, showCheckbox } = this.state;
    const { selectionLimit, onSelect, singleSelect } = this.props;
    if (singleSelect) {
      this.onSingleSelect(item);
      onSelect([item], item);
      return;
    }
    if (this.isSelectedValue(item)) {
      this.onRemoveSelectedItem(item);
      return;
    }
    if (selectionLimit === selectedValues.length) {
      return;
    }
    selectedValues.push(item);
    onSelect(selectedValues, item);
    this.setState({ selectedValues }, () => {
      if (!showCheckbox) {
        this.removeSelectedValuesFromOptions(true);
      }
    });
  }

  onSingleSelect = (item) => {
    this.setState({ selectedValues: [item], toggleOptionsList: false });
  }

  isSelectedValue = (item) => {
    const { isObject, displayValue } = this.props;
    const { selectedValues } = this.state;
    if (isObject) {
      return (
        selectedValues.filter((i) => i[displayValue] === item[displayValue])
          .length > 0
      );
    }
    return selectedValues.filter((i) => i === item).length > 0;
  }

  renderOptionList = () => {
    const { emptyRecordstyleg } = this.props;
    const { options } = this.state;
    return (
      <ul className="optionContainer" >
        {options.length === 0 && <span className="notFound" >{emptyRecordstyleg}</span>}
        {this.renderNormalOption()}
      </ul>
    );
  }

  renderGroupByOptions = () => {
    const {
      isObject = false, displayValue, showCheckbox, singleSelect,
    } = this.props;
    const { groupedObject } = this.state;
    return Object.keys(groupedObject).map((obj) => (
			<React.Fragment>
					<li key={obj} className='groupHeading' >{obj}</li>
					{groupedObject[obj].map((option, i) => (
						<li
							key={`option${i}`}
							style={style.option}
							className={`${style.groupChildEle} ${this.fadeOutSelection(option) && style.disableSelection} option`}
							onClick={() => this.onSelectItem(option)}
						>
							{showCheckbox && !singleSelect && (
								<input
									type="checkbox"
									className='checkbox'
									checked={this.isSelectedValue(option)}
								/>
							)}
							{isObject ? option[displayValue] : option.toString()}
						</li>
					))}
			</React.Fragment>
    ));
  }

  renderNormalOption = () => {
    const {
      isObject = false, displayValue, showCheckbox, singleSelect,
    } = this.props;
    const { highlightOption } = this.state;
    return this.state.options.map((option, i) => (
      <li
				key={`option${i}`}
        className={`${
          highlightOption === i ? 'highlightOption highlight' : ''
        } ${this.fadeOutSelection(option) && 'disableSelection'} option`}
        onClick={() => this.onSelectItem(option)}
      >
        {showCheckbox && !singleSelect && (
          <input
            type="checkbox"
            className={`checkbox ${style.checkbox}`}
            checked={this.isSelectedValue(option)}
          />
        )}
        {isObject ? option[displayValue] : option.toString()}
      </li>
    ));
  }

  renderSelectedList = () => {
    const { isObject = false, displayValue, singleSelect } = this.props;
    const { selectedValues } = this.state;
    return selectedValues.map((value, index) => (
      <span className={`chip ${style.chip} ${singleSelect && 'singleChip'} ${this.isDisablePreSelectedValues(value) && 'disableSelection'}`} key={index}>
        {!isObject ? value.toString() : value[displayValue]}
        <i
          className='icon_cancel closeIcon'
          onClick={() => this.onRemoveSelectedItem(value)}
        />
      </span>
    ));
  }

  isDisablePreSelectedValues = (value) => {
    const { isObject, disablePreSelectedValues, displayValue } = this.props;
    const { preSelectedValues } = this.state;
    if (!disablePreSelectedValues || !preSelectedValues.length) {
      return false;
    }
    if (isObject) {
      return (
        preSelectedValues.filter((i) => i[displayValue] === value[displayValue])
          .length > 0
      );
    }
    return preSelectedValues.filter((i) => i === value).length > 0;
  }

  fadeOutSelection = (item) => {
    const { selectionLimit, showCheckbox, singleSelect } = this.props;
    if (singleSelect) {
      return;
    }
    const { selectedValues } = this.state;
    if (selectionLimit === -1) {
      return false;
    }
    if (selectionLimit !== selectedValues.length) {
      return false;
    }
    if (selectionLimit === selectedValues.length) {
      if (!showCheckbox) {
        return true;
      }
      if (this.isSelectedValue(item)) {
        return false;
      }
      return true;
    }
  }

  toggelOptionList = () => {
    this.setState({
      toggleOptionsList: !this.state.toggleOptionsList,
      highlightOption: 0,
    });
  }

  renderMultiselectContainer = () => {
    const { inputValue, toggleOptionsList, selectedValues } = this.state;
    const { placeholder, singleSelect } = this.props;
    return (
      <div className='multiSelectContainer' id="multiselectContainerReact">
        <div className='searchWarpper'
          ref={this.searchWrapper}
          onClick={singleSelect ? this.toggelOptionList : () => {}}
        >
          {this.renderSelectedList()}
          <input
						type="text"
						ref={this.searchBox}
						className="searchBox"
            onChange={this.onChange}
            value={inputValue}
            onFocus={this.toggelOptionList}
            onBlur={() => setTimeout(this.toggelOptionList, 100)}
            placeholder={singleSelect && selectedValues.length ? '' : placeholder}
            onKeyDown={this.onArrowKeyNavigation}
            disabled={singleSelect}
          />
          {singleSelect && <i
            className='icon_cancel icon_down_dir'
          />}
        </div>
        <div
          className={`optionListContainer optionListContainer ${
            toggleOptionsList ? 'displayBlock' : 'displayNone'
          }`}
        >
          {this.renderOptionList()}
        </div>
      </div>
    );
  }

  render() {
    return this.renderMultiselectContainer();
  }
}

Multiselect.defaultProps = {
  options: [],
  disablePreSelectedValues: false,
  selectedValues: [],
  isObject: true,
  displayValue: 'model',
  showCheckbox: false,
  selectionLimit: -1,
  placeholder: 'Выбрать...',
  groupBy: '',
  style: {},
  emptyRecordstyleg: 'Нет данных',
  onSelect: () => {},
  onRemove: () => {},
  closeIcon: 'circle2',
  singleSelect: false,
};

export default Multiselect;
