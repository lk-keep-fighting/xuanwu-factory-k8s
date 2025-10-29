import { useEffect, useRef, useState } from 'react';
import { initialLogs } from '../data/mockData';

const additionalMessages = [
  '[2024-10-29 09:33:30] [INFO] 镜像推送完成，准备应用 Deployment',
  '[2024-10-29 09:33:32] [INFO] 应用配置映射 ConfigMap 已同步',
  '[2024-10-29 09:33:35] [WARN] 探针延迟增加，正在自动调节副本数',
  '[2024-10-29 09:33:38] [INFO] HPA 将副本从 4 调整至 6',
  '[2024-10-29 09:33:44] [INFO] 收集 Pod 事件日志',
  '[2024-10-29 09:33:50] [INFO] 应用稳定运行'
];

const Logs = () => {
  const [logs, setLogs] = useState(initialLogs);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextIndex = prev.length - initialLogs.length;
        if (nextIndex >= additionalMessages.length) {
          return prev;
        }
        return [...prev, additionalMessages[nextIndex]];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">实时日志</h2>
          <p className="section__subtitle">聚合部署流水线、Kubernetes 事件以及应用标准输出</p>
        </div>
        <div className="log-viewer" ref={logRef}>
          {logs.map((logLine, index) => (
            <pre className="log-line" key={`${logLine}-${index}`}>
              {logLine}
            </pre>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Logs;
