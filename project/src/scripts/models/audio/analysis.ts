/**
 * key: -1 to 11
 * loudness: -60 to 0
 * mode: -1, 0, 1
 * start_of_fade_out: # to song duration
 * tempo: BPM
 * time_signature: 3 to 7
 */

export type Track = {
  num_samples: number
  duration: number
  sample_md5: number
  offset_seconds: number
  window_seconds: number
  analysis_sample_rate: number
  analysis_channels: number
  end_of_fade_in: number
  start_of_fade_out: number
  loudness: number
  tempo: number
  tempo_confidence: number
  time_signature: number
  time_signature_confidence: number
  key: number
  key_confidence: number
  mode: number
  mode_confidence: number
}

export type Measure = {
  start: number
  duration: number
  confidence: number
}

export type Section = {
  start: number
  duration: number
  confidence: number
  loudness: number
  tempo: number
  tempo_confidence: number
  key: number
  key_confidence: number
  mode: number
  mode_confidence: number
  time_signature: number
  time_signature_confidence: number
}

export type Segment = {
  start: number
  duration: number
  confidence: number
  loudness_start: number
  loudness_max_time: number
  loudness_max: number
  loudness_end: number
  pitches: Array<number>
  timbre: Array<number>
}

export type Song = {
  track: Track
  bars: Array<Measure>
  beats: Array<Measure>
  sections: Array<Section>
  segments: Array<Segment>
  tatums: Array<Measure>
}