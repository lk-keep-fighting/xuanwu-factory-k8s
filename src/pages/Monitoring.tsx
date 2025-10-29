import { useEffect, useMemo, useState } from 'react';
import { Activity, Cpu, MemoryStick, Network } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import { infrastructureNodes } from '../data/mockData';

const generateSeries = () => Array.from({ length: 20 }, () => 40 + Math.random() * 50);

const Monitoring = () => {
  const [cpuSeries, setCpuSeries] = useState<number[]>(generateSeries);
  const [memorySeries, setMemorySeries] = useState<number[]>(generateSeries);
  const [networkSeries, setNetworkSeries] = useState<number[]>(generateSeries);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuSeries((series) => [...series.slice(1), 40 + Math.random() * 50]);
      setMemorySeries((series) => [...series.slice(1), 30 + Math.random() * 40]);
      setNetworkSeries((series) => [...series.slice(1), 20 + Math.random() * 60]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const latestCpu = cpuSeries[cpuSeries.length - 1];
  const latestMemory = memorySeries[memorySeries.length - 1];
  const latestNetwork = networkSeries[networkSeries.length - 1];

  const historicalAverage = useMemo(() => {
    const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    return {
      cpu: average(cpuSeries),
      memory: average(memorySeries),
      network: average(networkSeries)
    };
  }, [cpuSeries, memorySeries, networkSeries]);

  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">实时资源监控</h2>
          <p className="section__subtitle">在 Web 控制台中实时观察 Kubernetes 集群的 CPU、内存、网络与存储指标</p>
        </div>
        <div className="grid grid--cols-4">
          <MetricCard
            title="CPU 利用率"
            value={<span>{latestCpu.toFixed(0)}%</span>}
            description={`历史均值 ${historicalAverage.cpu}%`}
            trend={<span className="trend trend--info">实时刷新</span>}
          />
          <MetricCard
            title="内存占用"
            value={<span>{latestMemory.toFixed(0)}%</span>}
            description={`历史均值 ${historicalAverage.memory}%`}
            trend={<span className="trend trend--info">实时刷新</span>}
          />
          <MetricCard
            title="网络吞吐"
            value={<span>{latestNetwork.toFixed(0)}%</span>}
            description="峰值 4.2 Gbps"
            trend={<span className="trend trend--positive">稳定</span>}
          />
          <MetricCard
            title="存储使用率"
            value={<span>62%</span>}
            description="分布式块存储 Ceph"
            trend={<span className="trend trend--warning">关注 IO 峰值</span>}
          />
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">集群节点概览</h2>
          <p className="section__subtitle">多区域 Kubernetes 节点监控与告警</p>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>节点</th>
                <th>角色</th>
                <th>可用区</th>
                <th>K8s 版本</th>
                <th>CPU</th>
                <th>内存</th>
                <th>Pod 数量</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {infrastructureNodes.map((node) => (
                <tr key={node.name}>
                  <td>{node.name}</td>
                  <td>{node.role}</td>
                  <td>{node.zone}</td>
                  <td>{node.kubernetesVersion}</td>
                  <td>{node.cpu}</td>
                  <td>{node.memory}</td>
                  <td>{node.pods}</td>
                  <td>
                    <StatusBadge tone={node.status === '就绪' ? 'success' : 'warning'}>
                      {node.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">趋势图</h2>
          <p className="section__subtitle">实时数值动态更新，展示最近一分钟的资源曲线</p>
        </div>
        <div className="grid grid--cols-3">
          <div className="card card--mini-chart">
            <div className="card__title">
              <Cpu size={16} /> CPU
            </div>
            <Sparkline data={cpuSeries} color="var(--brand-primary)" />
          </div>
          <div className="card card--mini-chart">
            <div className="card__title">
              <MemoryStick size={16} /> 内存
            </div>
            <Sparkline data={memorySeries} color="var(--brand-success)" />
          </div>
          <div className="card card--mini-chart">
            <div className="card__title">
              <Network size={16} /> 网络
            </div>
            <Sparkline data={networkSeries} color="var(--brand-warning)" />
          </div>
        </div>
      </section>

      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">告警与事件</h2>
          <p className="section__subtitle">快速定位潜在风险，保障服务稳定</p>
        </div>
        <div className="card">
          <ul className="list">
            <li>
              <Activity size={16} /> sea-preview-worker-02 节点 CPU 持续 5 分钟超过 85%
              <StatusBadge tone="warning">处理中</StatusBadge>
            </li>
            <li>
              <Activity size={16} /> cn-prod-worker-04 节点磁盘 IO 峰值超 90%
              <StatusBadge tone="info">观察中</StatusBadge>
            </li>
            <li>
              <Activity size={16} /> gateway 服务金丝雀发布回滚完成
              <StatusBadge tone="success">已恢复</StatusBadge>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const maxValue = Math.max(...data, 100);
  const path = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={path} stroke={color} fill="none" strokeWidth={2} />
      <polyline
        points={`0,100 ${data
          .map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 100;
            return `${x},${y}`;
          })
          .join(' ')} 100,100`}
        fill={`${color}24`}
      />
    </svg>
  );
};

export default Monitoring;
