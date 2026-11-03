"""Original deterministic Foley primitives; no reference soundtrack is reused."""
import numpy as np
SR=48000
def event(kind,seed=0):
    rng=np.random.default_rng(seed)
    if kind=='tap':
        t=np.arange(round(.13*SR))/SR
        return (np.sin(2*np.pi*160*t)*.6+rng.normal(0,.17,len(t)))*np.exp(-t*55)*np.minimum(t/.002,1)
    if kind=='pop':
        t=np.arange(round(.22*SR))/SR
        return np.sin(2*np.pi*(700*t-800*t*t))*np.exp(-t*24)*np.minimum(t/.003,1)
    raise ValueError('Unknown original SFX type: '+kind)
