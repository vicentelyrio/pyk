type Variant = 'accent' | 'danger'

export function IconButton(props: {
  icon: string
  tooltip?: string
  variant?: Variant
  class?: string
  onClicked?: () => void
}) {
  const cls = ['bar-btn', props.variant, props.class].filter(Boolean).join(' ')

  return (
    <button class={cls} tooltipText={props.tooltip} onClicked={props.onClicked}>
      <image iconName={props.icon} />
    </button>
  )
}
