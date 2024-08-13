export interface NetLog {
    name: string;
    rpack: number;
    rbyte: number;
    rerrs: number;
    spack: number;
    sbyte: number;
    serrs: number;
    speed: string;
    duplex: number;
}

export interface DiskLog {
    dskname: string;
    io_ms: number;
    nread: number;
    nrsect: number;
    ndiscrd: number;
    nwrite: number;
    nwsect: number;
    avque: number;
    inflight: number;
}

export interface CpuLog {
    hertz: number;
    nrcpu: number;
    stime: number;
    utime: number;
    ntime: number;
    itime: number;
    wtime: number;
    Itime: number;
    Stime: number;
    steal: number;
    guest: number;
    freq: number;
    freqperc: number;
    instr: number;
    cycle: number;
}

export interface AtopLog {
    host: string;
    timestamp: number;
    elapsed: number;
    CPU: CpuLog;
    MEM: {
        physmem: number;
        freemem: number;
        cachemem: number;
        buffermem: number;
        slabmem: number;
        cachedrt: number;
        slabreclaim: number;
        vmwballoon: number;
        shmem: number;
        shmrss: number;
        shmswp: number;
        hugepagesz: number;
        tothugepage: number;
        freehugepage: number;
    };
    DSK: DiskLog[];
    NET_GENERAL: {
        rpacketsTCP: number;
        spacketsTCP: number;
        activeOpensTCP: number;
        passiveOpensTCP: number;
        retransSegsTCP: number;
        rpacketsUDP: number;
        spacketsUDP: number;
        rpacketsIP: number;
        spacketsIP: number;
        dpacketsIP: number;
        fpacketsIP: number;
        icmpi: number;
        icmpo: number;
    };
    NET: NetLog[];
}
