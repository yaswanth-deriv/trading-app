import styles from "./App.module.scss";
import { Routes, Route } from "solid-app-router";
import { createEffect } from "solid-js";
import { loginUrl } from "Constants/deriv-urls";
import Endpoint from "Routes/endpoint";
import { endpoint, init, login_information, logout } from "Stores/base-store";
import { onMount } from "solid-js";
import { Portal } from "solid-js/web";
import { fetchActiveSymbols, watchListRef } from "./stores";
import Dashboard from "./routes/dashboard/dashboard";
import monitorNetwork from "Utils/network-status";
import Trade from "./routes/trade/trade";
import { onCleanup } from "solid-js";
import { sendRequest } from "./utils/socket-base";

function App() {
  const { network_status } = monitorNetwork();

  onMount(async () => {
    await fetchActiveSymbols();
  });

  createEffect(() => {
    init();
  });

  onCleanup(() => {
    localStorage.removeItem("favourites");
    watchListRef().forEach((symbol) =>
      sendRequest({ forget: watchListRef()[symbol] })
    );
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        {login_information.is_logged_in ? (
          <div onClick={logout}>Sign Out</div>
        ) : (
          <div
            onClick={() =>
              (window.location.href = loginUrl({ language: "en" }))
            }
          >
            Log In
          </div>
        )}
      </header>
      <section class={styles.content}>
        <Portal>
          {network_status.is_disconnected && (
            <div class={styles.banner}>
              <div class={styles.caret} />
              <div class={styles.disconnected}>You seem to be offline.</div>
            </div>
          )}
        </Portal>
        <Routes>
          <Route element={<Endpoint />} path="/endpoint" />
          <Route path="/" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
        </Routes>
      </section>
      <footer>
        <div>
          The server <a href="/endpoint">endpoint</a> is:
          <span>{endpoint.server_url}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
