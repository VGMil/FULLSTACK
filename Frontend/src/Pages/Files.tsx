function Files({...scanState}) {


  return (
    <div>
      {Object.entries(scanState.user).map(([key, value]) => (
        <div key={key}>
          <span>{key}: </span>
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

export default Files