import { Button } from './Button'

const OPEN_CLASS = 'qcp-modal-open'
const CLOSED_CLASS = 'qcp-modal-closed'
const HIDDEN_CLASS = 'qcp-hidden'

const toggleOpen = () => {
  const modalClassList = document.querySelector('#qcp-modal')?.classList
  if (modalClassList?.contains(OPEN_CLASS)) {
    modalClassList.replace(OPEN_CLASS, CLOSED_CLASS)
    document.querySelector('#qcp-modal-background')?.classList.add(HIDDEN_CLASS)
  } else {
    modalClassList?.replace(CLOSED_CLASS, OPEN_CLASS)
    document.querySelector('#qcp-modal-background')?.classList.remove(HIDDEN_CLASS)
  }
}

/**
 *  Button used to toggle the help popup
 */
export const HelpButton = () => (
  <Button onClick={toggleOpen}>?</Button>
)

/**
 * Popup element containing help text. Includes a background element to simulate the behaviour of the native alert().
 */
export const HelpPopup = () => (
  <>
    <div id='qcp-modal-background' className={HIDDEN_CLASS} />
    <div id='qcp-modal' className={CLOSED_CLASS}>
      <div className='qcp-modal-title'>Plot Controls</div>
      <ul>
        <li>While holding Ctrl use the mouse wheel to zoom</li>
        <li>Drawing a box with the left mouse button:</li>
        <ul>
          <li>If flag mode is off will zoom onto that region</li>
          <li>With flag mode on will select all points in that region to be flagged</li>
        </ul>
        <li>Clicking the colour boxes in the legend will allow you to customise the colours</li>
        <li>Hot keys:</li>
        <table className='qcp-hotkey-table' style={{ marginLeft: '1em' }}>
          <tbody>
            <tr><td>F</td><td>toggle flag mode</td></tr>
            <tr><td>R</td><td>reset zoom to default level</td></tr>
            <tr><td>B</td><td>fullscreen mode</td></tr>
            <tr><td>D</td><td>toggle dark mode</td></tr>
            <tr><td>Q/W</td><td>prev/next parameter (if only one is selected)</td></tr>
            <tr><td>A/S</td><td>prev/next ID (if only one is selected)</td></tr>
            <tr><td>Esc</td><td>Clear current flagging selection</td></tr>
          </tbody>
        </table>
      </ul>

      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button onClick={toggleOpen}>Close</Button>
      </div>
    </div>
  </>
)
