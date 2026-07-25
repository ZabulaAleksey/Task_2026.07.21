import { mount } from "svelte";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./app.css";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app")! });
