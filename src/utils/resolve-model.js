import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import shallowEqual from './shallow-equal';

const ReactComponent = PureComponent || Component;

function resolveModel(model, parentModel) {
  if (parentModel) {
    if (model[0] === '.' || model[0] === '[') {
      return `${parentModel}${model}`;
    }

    if (typeof model === 'function') {
      return (state) => model(state, parentModel);
    }
  }

  return model;
}

export default function wrapWithModelResolver(WrappedComponent, deepKeys = [], omitKeys = []) {
  class ResolvedModelWrapper extends ReactComponent {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
      return !shallowEqual(this.context, nextContext) || !shallowEqual(this.props, nextProps, {
        deepKeys,
        omitKeys,
      });
    }
    render() {
      const {
        model: parentModel,
        localStore,
      } = this.context;

      const resolvedModel = resolveModel(
        this.props.model,
        parentModel);

      return (<WrappedComponent
        {...this.props}
        model={resolvedModel}
        store={localStore || undefined}
      />);
    }
  }

  ResolvedModelWrapper.displayName = `Modeled(${WrappedComponent.displayName})`;

  ResolvedModelWrapper.propTypes = {
    model: PropTypes.any,
  };

  ResolvedModelWrapper.contextTypes = {
    model: PropTypes.any,
    localStore: PropTypes.shape({
      subscribe: PropTypes.func,
      dispatch: PropTypes.func,
      getState: PropTypes.func,
    }),
  };

  return ResolvedModelWrapper;
}
