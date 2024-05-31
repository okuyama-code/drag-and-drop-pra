import React, { useEffect, useRef, useState } from 'react';

const AutoScroll: React.FC = () => {
  // スクロールの状態を管理するステート変数
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  // コンテンツ要素への参照を保持するためのuseRef
  const contentRef = useRef<HTMLDivElement>(null);

  // マウスの移動とマウスが画面から離れたイベントを監視するためのuseEffect
  useEffect(() => {
    // マウスの移動イベントハンドラ
    const handleMouseMove = (event: MouseEvent) => {
      // マウスのY座標を取得
      const { clientY } = event;
      // コンテンツ要素の上端と下端の座標を取得
      const { top, bottom } = contentRef.current!.getBoundingClientRect();

      // マウスが上端に近づいた場合
      if (clientY <= top + 20) {
        setIsScrolling(true); // スクロール中に設定
        setScrollDirection('up'); // スクロール方向を上に設定
      }
      // マウスが下端に近づいた場合
      else if (clientY >= bottom - 20) {
        setIsScrolling(true); // スクロール中に設定
        setScrollDirection('down'); // スクロール方向を下に設定
      }
      // マウスが端から離れた場合
      else {
        setIsScrolling(false); // スクロールを停止
        setScrollDirection(null); // スクロール方向をリセット
      }
    };

    // マウスが画面から離れたイベントハンドラ
    const handleMouseLeave = () => {
      setIsScrolling(false); // スクロールを停止
      setScrollDirection(null); // スクロール方向をリセット
    };

    // マウスの移動とマウスが画面から離れたイベントをリスン
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // クリーンアップ関数でイベントリスナーを削除
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []); // 空の依存配列で初回のみ実行

  // スクロールを実行するためのuseEffect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // スクロール中の場合
    if (isScrolling) {
      // 一定間隔でスクロールを実行
      intervalId = setInterval(() => {
        // スクロール方向が上の場合
        if (scrollDirection === 'up') {
          contentRef.current!.scrollTop -= 10; // 上にスクロール
        }
        // スクロール方向が下の場合
        else if (scrollDirection === 'down') {
          contentRef.current!.scrollTop += 10; // 下にスクロール
        }
      }, 50); // 50ミリ秒ごとにスクロールを実行
    }

    // クリーンアップ関数でスクロールを停止
    return () => {
      clearInterval(intervalId);
    };
  }, [isScrolling, scrollDirection]); // isScrollingとscrollDirectionが変更された場合に実行

  // レンダリング
  return (
    <div
      ref={contentRef}
      style={{ height: '400px', overflow: 'auto', border: '1px solid black' }}
    >
      {/* スクロールするコンテンツをここに追加 */}
      <div style={{ height: '1000px' }}>
        {/* 例: 長いコンテンツ */}
        <h1>Auto Scroll Example</h1>
        <p>
          This is an example of auto scrolling when the mouse is near the top or bottom of the
          content area.
        </p>
        {/* ... */}
      </div>
    </div>
  );
};

export default AutoScroll;