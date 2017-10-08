import React from "react";
import { renderToString } from "react-dom/server";
import AppPage from "./AppPage";
import DispatchAction from "./DispatchAction";

export default async function ReactComponentHandleGet(
  req,
  res,
  next,
  navAction
) {
  const Component = navAction.component;
  if (req.method === "GET") {
    const { auth, params, path, query } = req;
    let data = null;
    const dispatch = action =>
      DispatchAction({
        ...action,
        viewerUser: auth && auth.user,
        viewerSession: auth && auth.session
      });
    if (Component.load) {
      try {
        data = await Component.load({
          auth,
          params: { ...params, ...query },
          path,
          dispatch
        });
      } catch (e) {
        next();
        return;
      }
    }
    const pageProps = { auth, params, path, data };
    const title = AppPage.getTitle(Component.getTitle(pageProps));
    const script =
      Component.getBrowserModule && Component.getBrowserModule(pageProps);
    const appHtml = renderToString(
      <AppPage title={title} script={script} pageProps={pageProps}>
        <Component {...pageProps} dispatch={dispatch} />
      </AppPage>
    );
    res.send(appHtml);
    return;
  }
  res.status(405).send();
}
