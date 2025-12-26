import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";
import { DebugProvider } from "./debug/DebugProvider.tsx";

import { routeTree } from "./routeTree.gen";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
    routeTree,
    context: {
        ...TanStackQueryProviderContext,
    },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
                <DndProvider backend={HTML5Backend}>
                    <DebugProvider>
                        <RouterProvider router={router} />
                    </DebugProvider>
                </DndProvider>
            </TanStackQueryProvider.Provider>
        </StrictMode>,
    );
}

reportWebVitals();
