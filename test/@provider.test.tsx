import React, { Component } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { provider, inject, InjectorContext } from "../src";

function sharedTests() {
  it("should dispose created instances", () => {
    class AppService {
      dispose = jest.fn();
    }

    class PageService {
      @inject appService: AppService;

      dispose = jest.fn();
    }

    class AnotherService {
      @inject appService: AppService;
    }

    @provider(AppService)
    class App extends Component {
      @inject appService: AppService;

      render() {
        app = this;
        return <Page />;
      }
    }
    let app: App;

    @provider(PageService, AnotherService)
    class Page extends Component {
      @inject pageService: PageService;
      @inject anotherService: AnotherService;

      render() {
        page = this;
        return <div />;
      }
    }
    let page: Page;

    const container = document.createElement("div");

    render(<App />, container);

    expect(app.appService).toBeInstanceOf(AppService);
    expect(page.pageService).toBeInstanceOf(PageService);
    expect(page.anotherService).toBeInstanceOf(AnotherService);

    unmountComponentAtNode(container);

    expect(app.appService.dispose).toBeCalledTimes(1);
    expect(page.pageService.dispose).toBeCalledTimes(1);
  });

  it("should accept declarations with .register() method", () => {
    class AppService {}

    class PageService {
      @inject appService: AppService;
    }

    @provider()
    class App extends Component {
      @inject appService: AppService;

      render() {
        app = this;
        return <Page />;
      }
    }
    let app: App;

    @provider()
    class Page extends Component {
      @inject pageService: PageService;

      render() {
        page = this;
        return <div />;
      }
    }
    let page: Page;

    App.register(AppService);
    Page.register(PageService);

    render(<App />, document.createElement("div"));

    expect(app.appService).toBeInstanceOf(AppService);
    expect(page.pageService).toBeInstanceOf(PageService);
  });
}

describe("@provider decorator", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  sharedTests();

  it("should warn about Class.contextType changes", () => {
    @provider()
    class App extends Component {}

    App.contextType = React.createContext(null);

    expect(console.error).toBeCalled();
    expect(App.contextType).toBe(InjectorContext);
  });
});

describe("@provider decorator in PRODUCTION mode", () => {
  beforeAll(() => {
    __DEV__ = false;
  });

  afterAll(() => {
    __DEV__ = true;
  });

  sharedTests();

  it("should not warn about Class.contextType changes", () => {
    @provider()
    class App extends Component {}

    expect(App.contextType).toBe(InjectorContext);

    App.contextType = React.createContext(null);

    expect(App.contextType).not.toBe(InjectorContext);
  });
});
