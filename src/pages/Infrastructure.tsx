import StatusBadge from '../components/ui/StatusBadge';
import { infrastructureNodes } from '../data/mockData';

const Infrastructure = () => {
  return (
    <div className="page">
      <section className="page__section">
        <div className="section__header">
          <h2 className="section__title">基础设施</h2>
          <p className="section__subtitle">集中管理 Kubernetes 集群、节点与命名空间资源</p>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>节点名称</th>
                <th>角色</th>
                <th>可用区</th>
                <th>K8s 版本</th>
                <th>CPU</th>
                <th>内存</th>
                <th>Pod 已用</th>
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
        <h2 className="section__title">命名空间与工作负载</h2>
        <div className="grid grid--cols-3">
          <div className="card">
            <h3>命名空间管理</h3>
            <ul className="list list--bulleted">
              <li>按项目与环境自动划分命名空间</li>
              <li>支持网络隔离与资源配额</li>
              <li>自动清理合并请求预览环境</li>
            </ul>
          </div>
          <div className="card">
            <h3>服务网格</h3>
            <ul className="list list--bulleted">
              <li>可选 Istio 与 Linkerd 接入</li>
              <li>全链路追踪与灰度发布</li>
              <li>可视化路由与熔断策略</li>
            </ul>
          </div>
          <div className="card">
            <h3>安全治理</h3>
            <ul className="list list--bulleted">
              <li>组件镜像安全扫描</li>
              <li>内置准入控制策略</li>
              <li>集群合规基线巡检</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Infrastructure;
