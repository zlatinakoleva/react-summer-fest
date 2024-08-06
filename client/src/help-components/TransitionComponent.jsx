import { useContext } from 'react';
import { SwitchTransition, Transition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

import TransitionContext from '../contexts/transitionContext';

const TransitionComponent = ({ children }) => {
  const location = useLocation();
  const { toggleCompleted } = useContext(TransitionContext);

  return (
    <SwitchTransition>
      <Transition
        key={location.pathname}
        timeout={500}
        onEnter={(page) => {
          toggleCompleted(false);
          gsap.set(page, { autoAlpha: 0, scale: 0.7, xPercent: -100, opacity: .5 });
          gsap
            .timeline({
              paused: true,
              onComplete: () => toggleCompleted(true),
            })
            .to(page, { autoAlpha: 1, xPercent: 0, duration: 0.25 })
            .to(page, { scale: 1, duration: 0.25,  opacity: 1 })
            .play();
        }}
        onExit={(page) => {
          gsap
            .timeline({ paused: true })
            .to(page, { scale: 0.7, duration: 0.2, opacity: .5  })
            .to(page, { xPercent: 100, autoAlpha: 0, duration: 0.2 })
            .play();
        }}
      >
        {children}
      </Transition>
    </SwitchTransition>
  );
};

export default TransitionComponent;
