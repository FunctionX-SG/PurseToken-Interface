export default function SubgraphDelayWarning() {
  return (
    <div className="alert alert-warning" role="alert">
      Please note that our subgraph is currently experiencing a slight
      synchronization delay. The following data may not be up to date.
    </div>
  );
}
