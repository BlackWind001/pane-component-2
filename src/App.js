import "./styles.css";
import { PaneArea, Pane } from "./Pane";
import React from "react";
import styled from "styled-components";

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  & .main-content {
    flex-grow: 1;
  }

  & form  {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

const LOCAL_STORAGE_KEY = 'panesProps';

const RepeatableContent = ({
  size,
  minSize,
  maxSize,
  onSubmit
}) => {
  const [controlledSize, setControlledSize] = React.useState(size);
  const [controlledMinSize, setControlledMinSize] = React.useState(minSize);
  const [controlledMaxSize, setControlledMaxSize] = React.useState(maxSize);
  return (
    <form onSubmit={(evt) => {
      evt.preventDefault();
      const resultObj = {};
      Array.from(evt.target.elements).forEach((element) => {
        resultObj[element.name] = element.value
      })

      onSubmit(resultObj);
    }}>
      <label>
        <input
          type='text'
          placeholder='Enter size of pane'
          name='size'
          value={controlledSize || ''}
          onChange={ (evt) => { setControlledSize(evt.target.value); } }
        />
      </label>
      <label>
        <input
          type='text'
          placeholder='Enter min size of pane'
          name='minSize'
          value={controlledMinSize || ''}
          onChange={ (evt) => { setControlledMinSize(evt.target.value); } }
        />
      </label>
      <label>
        <input
          type='text'
          placeholder='Enter max size of pane'
          name='maxSize'
          value={controlledMaxSize || ''}
          onChange={ (evt) => { setControlledMaxSize(evt.target.value); } }
        />
      </label>
      <input type='submit' value='Submit' />
    </form>
  );
}

export default function App() {
  const [ PADirection, setPADirection ] = React.useState('row');
  const [ panesCount, setPanesCount ] = React.useState(0);
  const [panesProps, setPanesProps] = React.useState([]);

  const onSubmitPaneProps = (index, props) => {
    const newPanesProps = panesProps.slice();

    newPanesProps[index] = props;

    setPanesProps(newPanesProps);
  }

  React.useEffect(() => {
    const storedPanesProps = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const body = document.querySelector('body');

    if (storedPanesProps) {
      setPanesProps(storedPanesProps);
    }

    body.addEventListener('keydown', (evt) => {
      console.log('Key down', evt.key, evt.ctrlKey, panesProps)
      if (evt.key === '.' && evt.ctrlKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(panesProps))
      }
    })
  }, [])

  React.useEffect(() => {
    setTimeout(() => {
      const x = document.querySelector('iframe');
      x && x.remove();
    }, 1000)
  })

  return (
    <StyledApp className="App">
      <div>
        <form>
          <p>Choose how the panes should be stacked</p>
          <div>
            <label>
              <input type='radio' value='row' name='PADirection' onChange={() => { setPADirection('row') }} checked={PADirection === 'row'} />
              Row
            </label>
            <label>
              <input type='radio' value='column' name='PADirection' onChange={() => { setPADirection('column') }} checked={PADirection === 'column'} />
              Column
            </label>
          </div>
          <div>
            <label>
              <button onClick={(evt) => {
                evt.preventDefault();

                setPanesCount(panesCount+1)

                const newPanesProps = panesProps.slice();
                newPanesProps.push({});
                setPanesProps(newPanesProps);
              }}>Increase panes</button>
            </label>
            <label>
              <button onClick={(evt) => {
                evt.preventDefault();

                setPanesCount(0);

                const newPanesProps = [];
                setPanesProps(newPanesProps);

                localStorage.removeItem(LOCAL_STORAGE_KEY);
              }}>Reset panes</button>
            </label>
          </div>
        </form>
      </div>
      <div className="main-content">
        <PaneArea direction={PADirection}>
          {
            panesProps.map((paneProps, index) => {
              return (
                <Pane key={index} {...paneProps}>
                  <RepeatableContent
                    {...paneProps}
                    onSubmit={onSubmitPaneProps.bind(null, index)}
                  />
                </Pane>
              );
            })
          }
        </PaneArea>
      </div>
    </StyledApp>
  );
}
