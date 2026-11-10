/** 统一日志适配：优先 cordis logger 服务，其次老宿主 ctx.log，最后退回 console。 */
export function createLog(ctx) {
    return (level, message, fields) => {
        const logger = ctx.logger;
        if (logger) {
            const write = level === 'warn' || level === 'error' ? logger.warn : level === 'debug' ? logger.debug : logger.info;
            if (typeof write === 'function') {
                write.call(logger, fields ? `${message} ${JSON.stringify(fields)}` : message);
                return;
            }
        }
        if (typeof ctx.log === 'function') {
            ctx.log(level === 'debug' ? 'info' : level, message, fields);
            return;
        }
        const write = level === 'warn' || level === 'error' ? console.warn : console.log;
        write(fields ? `${message} ${JSON.stringify(fields)}` : message);
    };
}
//# sourceMappingURL=dshContext.js.map