import { expect, test } from "bun:test"
import { Window } from "happy-dom"
import React, { act } from "react"
import { renderToString } from "react-dom/server"
import { createRoot, hydrateRoot } from "react-dom/client"
import { useRequestPanel } from "../src/hooks/useRequestPanel"

test("saved open state is present in server HTML and stays open during hydration", async () => {
  const dom = new Window({ url: "http://localhost" })
  Object.assign(globalThis, { window: dom, document: dom.document, IS_REACT_ACT_ENVIRONMENT: true })
  document.cookie = "request-panel-open=true; Path=/"
  const renders: boolean[] = []
  let toggle: (open: boolean) => void = () => {}
  function Harness({ initialOpen }: { initialOpen: boolean }) {
    const [open, setOpen] = useRequestPanel(initialOpen)
    toggle = setOpen
    renders.push(open)
    return <div data-open={String(open)} />
  }
  const html = renderToString(<Harness initialOpen={true} />)
  expect(html).toContain('data-open="true"')
  const host = document.createElement("div")
  host.innerHTML = html
  document.body.appendChild(host)
  let root: ReturnType<typeof hydrateRoot>
  await act(async () => { root = hydrateRoot(host, <Harness initialOpen={true} />) })
  expect(renders.every(Boolean)).toBe(true)
  await act(async () => toggle(false))
  expect(document.cookie).toContain("request-panel-open=false")
  expect(host.firstElementChild?.getAttribute("data-open")).toBe("false")
  await act(async () => root!.unmount())

  // A prefetched page can carry an older server prop; the client preference wins.
  const nextRoot = createRoot(host)
  await act(async () => nextRoot.render(<Harness initialOpen={true} />))
  expect(host.firstElementChild?.getAttribute("data-open")).toBe("false")
  await act(async () => toggle(true))
  expect(document.cookie).toContain("request-panel-open=true")
  await act(async () => nextRoot.unmount())
  host.remove()
})
