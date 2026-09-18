# Large JMeter runs

Drop your real `.jtl` exports here, then run from the project root:

```bash
npm run seed          # imports samples/ and samples/large/
npm run seed -- --reset   # wipes the database first
npm run seed -- /path/to/run.jtl
```

Files in this folder are git-ignored on purpose: real runs weigh tens of MB.
Two examples used during development:

| File | Size | Samples |
| --- | --- | --- |
| `data_writer_diagpro.pin.itg.tbd.euw3r53.nbyt.fr_ELASTIC_LARGE_NORMAL.jtl` | 37 MB | 109 944 |
| `data_writer_diagpro.pin.itg3.tbd.euw3r53.nbyt.fr_ELASTIC_LARGE_NORMAL.jtl` | 45 MB | 136 642 |

Both are CSV `.jtl` files with the standard JMeter header
(`timeStamp,elapsed,label,responseCode,...,Latency,IdleTime,Connect`).
Anything above `MAX_UPLOAD_MB` (64 MB by default) is rejected by the API and
skipped by the seed script.
