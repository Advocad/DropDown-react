import React, { Component } from "react";
import style from "./style.css";

export class Multiselect extends Component {

  state = {
    inputValue: "",
    options: props.options,
    filteredOptions: props.options,
    unfilteredOptions: props.options,
    selectedValues: Object.assign([], props.selectedValues),
    preSelectedValues: Object.assign([], props.selectedValues),
    toggleOptionsList: false,
    highlightOption: 0,
    showCheckbox: props.showCheckbox,
    groupedObject: [],
    closeIconType: closeIconTypes[props.closeIcon] || closeIconTypes['circle']
  };

  renderMultiselectContainer = () => {
    const { inputValue, toggleOptionsList, selectedValues } = this.state;
    const { placeholder, singleSelect } = this.props;
    return (
      <div className={style.multiSelectContainer} id="multiselectContainerReact">
        <div className={`${style.searchWarpper} ${singleSelect ? style.singleSelect : ''}`} 
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
          />
          {singleSelect && <i
            className={`icon_cancel ${style.icon_down_dir}`}
          />}
        </div>
        <div
          className={`optionListContainer ${ms.optionListContainer} ${
            toggleOptionsList ? ms.displayBlock : ms.displayNone
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