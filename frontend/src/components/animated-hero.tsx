"use client"
import React, { useState, useEffect } from 'react';

interface Props {
  text: string
  emphasis: number[]
}

function alternateSort(indices: number[]) {
  indices.sort((a, b) => a - b);
  const alternatedIndices = [];
  let start = 0;
  let end = indices.length - 1;
  while (start <= end) {
    if (start === end) {
      alternatedIndices.push(indices[start]);
    } else {
      alternatedIndices.push(indices[start]);
      alternatedIndices.push(indices[end]);
    }
    start++;
    end--;
  }
  return alternatedIndices;
}

const AnimatedHeroText = (props: Props) => {
  const text = props.text
  const [visibleChars, setVisibleChars] = useState(new Set());
  const [animatingChars, setAnimatingChars] = useState(new Set());

  useEffect(() => {
    const indices = Array.from({ length: text.length }, (_, i) => i);
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const ran = Math.random()

    let shuffledIndices;
    if (ran < 0.25) {
      shuffledIndices = indices.sort(() => Math.random() - 0.5);
    } else if (ran < 0.5) {
      shuffledIndices = indices.sort((a, b) => a - b);
    } else if (ran < 0.75) {
      shuffledIndices = indices.sort((a, b) => b - a);
    } else {
      shuffledIndices = alternateSort(indices)
    }

    shuffledIndices.forEach((index, i) => {
      const animationTimeout = setTimeout(() => {
        setAnimatingChars(prev => new Set([...prev, index]));
      }, i * 20);
      const charTimeout = setTimeout(() => {
        setVisibleChars(prev => new Set([...prev, index]));
        setTimeout(() => {
          setAnimatingChars(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
        }, 150);
      }, i * 20 + 30);
      timeouts.push(animationTimeout, charTimeout);
    });
    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [text.length]);

  const words = text.match(/\S+\s*/g) || [];
  let currentIndex = 0;
  const emphasis = props.emphasis

  return (
    <h1 className="flex max-w-7xl flex-wrap bg-gradient-to-r from-green-700 to-green-500 bg-clip-text pt-10 font-mono text-5xl tracking-tighter dark:to-green-400 sm:text-6xl md:text-7xl lg:text-8xl">
      {words.map((word, wordIndex) => {
        const chars = word.split('').map((char, i) => {
          const absoluteIndex = currentIndex + i;
          return (
            <React.Fragment key={absoluteIndex}>
              {char === "C" ? <br /> : null}
              <span
                className={`${animatingChars.has(absoluteIndex)
                  ? 'bg-black dark:bg-white'
                  : 'bg-transparent'
                  } inline-block transition-all duration-300 `}
              >
                {visibleChars.has(absoluteIndex) ? (
                  <span className={`
                    ${animatingChars.has(absoluteIndex)
                      ? "text-white dark:text-black"
                      : "text-black dark:text-white"}
                    ${emphasis.includes(absoluteIndex) ? "font-bold !text-transparent dark:!text-transparent!" : "font-normal"} 
                  `}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ) : (
                  <span className="opacity-0">{char === ' ' ? '\u00A0' : char}</span>
                )}
              </span>
            </React.Fragment>
          );
        });

        currentIndex += word.length;

        return (
          <span
            key={`word-${wordIndex}`}
            className="inline-flex"
          >
            {chars}
          </span>
        );
      })}
    </h1>
  );
};

export default AnimatedHeroText;
