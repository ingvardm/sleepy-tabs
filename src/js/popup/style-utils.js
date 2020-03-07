export function buildClassName(classNames = []) {
    const sanitized = classNames.reduce((all, className) => {
        if (!!className) all.push(className)
        return all
    }, [])
    return sanitized.join(' ')
}