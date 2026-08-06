import { Button } from './Button'

const OPEN_CLASS = 'qcp-modal-open'
const CLOSED_CLASS = 'qcp-modal-closed'

const tooggleOpen = () => {
  const modalClassList = document.querySelector('#qcp-modal')?.classList
  if (modalClassList?.contains(OPEN_CLASS)) {
    modalClassList.replace(OPEN_CLASS, CLOSED_CLASS)
    document.querySelector('#qcp-modal-background')?.classList.add('qcp-hidden')
  } else {
    modalClassList?.replace(CLOSED_CLASS, OPEN_CLASS)
    document.querySelector('#qcp-modal-background')?.classList.remove('qcp-hidden')
  }
}

/**
 *  Button used to toggle the help popup
 */
export const HelpButton = () => (
  <Button onClick={tooggleOpen}>?</Button>
)

/**
 * Popup element containing help text. Includes a background element to simulate the behaviour of the native alert().
 */
export const HelpPopup = () => (
  <>
    <div id='qcp-modal-background' className='qcp-hidden' />
    <div id='qcp-modal' className={CLOSED_CLASS}>
      <b>Plot controls</b>
      <ul>
        <li> While holding Ctrl use the mouse wheel to zoom</li>
        <li> Drawing a box with the left mouse button:</li>
        <ul>
          <li> If flag mode is off will zoom onto that region</li>
          <li>  With flag mode on will select all points in that region to be flagged</li>
        </ul>
        <li> Clicking the colour boxes in the legend will allow you to customise the colours</li>
        <li> Hot keys</li>
        <ul>
          <li> <b>F</b>: toggle flag mode</li>
          <li> <b>R</b>: reset zoom to default level</li>
          <li> <b>B</b>: fullscreen mode</li>
          <li> <b>D</b>: toggle dark mode</li>
          <li> <b>Q/W</b>: prev/next parameter (if only one is selected)</li>
          <li> <b>A/S</b>: prev/next ID (if only one is selected)</li>
          <li> <b>Esc</b>: Clear current flagging selection</li>
        </ul>
      </ul>

      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button onClick={tooggleOpen}>Close</Button>
      </div>
    </div>
  </>
)
