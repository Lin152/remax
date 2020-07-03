import * as React from 'react';
import isClassComponent from './utils/isClassComponent';
import { Lifecycle, Callback, callbackName } from './lifecycle';
import PageInstanceContext from './PageInstanceContext';
import { ForwardRef } from './ReactIs';
import Container from './Container';

export interface PageProps<Q = {}> {
  location: {
    query: Q;
  };
}

export default function createPageWrapper(Page: React.ComponentType<any>) {
  return class PageWrapper extends React.Component<{ page: any; container: Container; query: any }> {
    // 页面组件的实例
    pageComponentInstance: any = null;

    callbacks = new Map<
      string,
      {
        callbacks: Callback[];
      }
    >();

    constructor(props: any) {
      super(props);

      Object.keys(Lifecycle).forEach(phase => {
        const callback = callbackName(phase);
        (this as any)[callback] = (...args: any[]) => {
          return this.callLifecycle(phase, ...args);
        };
      });
    }

    callLifecycle(phase: string, ...args: any[]) {
      const callback = callbackName(phase);
      if (this.pageComponentInstance && typeof this.pageComponentInstance[callback] === 'function') {
        return this.pageComponentInstance[callback](...args);
      }
    }

    render() {
      const props: any = {
        location: {
          query: this.props.query || {},
        },
      };

      if (isClassComponent(Page) || (Page as any).$$typeof === ForwardRef) {
        props.ref = (node: any) => (this.pageComponentInstance = node);
      }

      return React.createElement(
        PageInstanceContext.Provider,
        { value: { page: this.props.page, container: this.props.container } },
        React.createElement(Page, props)
      );
    }
  };
}
