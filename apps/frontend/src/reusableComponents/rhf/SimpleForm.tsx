import { observer } from 'mobx-react-lite'
import { FormEvent, PropsWithChildren, useCallback } from 'react'

type SimpleFormProps = PropsWithChildren<{
    onSubmit?: () => void
    stopPropagation?: boolean
    preventDefault?: boolean
    className?: string
}>

export const SimpleForm = observer<SimpleFormProps>(
    ({ children, className, onSubmit, preventDefault = true, stopPropagation = true }) => {
        const handleSubmit = useCallback(
            (e: FormEvent<HTMLFormElement>) => {
                if (stopPropagation) e.stopPropagation()
                if (preventDefault) e.preventDefault()

                onSubmit?.()
            },
            [onSubmit]
        )

        return (
            <form className={className} onSubmit={handleSubmit}>
                {children}
            </form>
        )
    }
)
