(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_PARAMS = {
    sampleRate: 44100,
};
function ACF2PLUS(params) {
    if (params === void 0) { params = DEFAULT_PARAMS; }
    var config = __assign(__assign({}, DEFAULT_PARAMS), params);
    var sampleRate = config.sampleRate;
    // Implements the ACF2+ algorithm
    return function ACF2PLUSDetector(float32AudioBuffer) {
        var maxShift = float32AudioBuffer.length;
        var rms = 0;
        var i, j, u, tmp;
        for (i = 0; i < maxShift; i++) {
            tmp = float32AudioBuffer[i];
            rms += tmp * tmp;
        }
        rms = Math.sqrt(rms / maxShift);
        if (rms < 0.01)
            // not enough signal
            return -1;
        /* Trimming cuts the edges of the signal so that it starts and ends near zero.
         This is used to neutralize an inherent instability of the ACF version I use.*/
        var aux1 = 0;
        var aux2 = maxShift - 1;
        var thres = 0.2;
        for (i = 0; i < maxShift / 2; i++)
            if (Math.abs(float32AudioBuffer[i]) < thres) {
                aux1 = i;
                break;
            }
        for (i = 1; i < maxShift / 2; i++)
            if (Math.abs(float32AudioBuffer[maxShift - i]) < thres) {
                aux2 = maxShift - i;
                break;
            }
        var frames = float32AudioBuffer.slice(aux1, aux2);
        var framesLength = frames.length;
        var calcSub = new Array(framesLength).fill(0);
        for (i = 0; i < framesLength; i++)
            for (j = 0; j < framesLength - i; j++)
                calcSub[i] = calcSub[i] + frames[j] * frames[j + i];
        u = 0;
        while (calcSub[u] > calcSub[u + 1])
            u++;
        var maxval = -1, maxpos = -1;
        for (i = u; i < framesLength; i++) {
            if (calcSub[i] > maxval) {
                maxval = calcSub[i];
                maxpos = i;
            }
        }
        var T0 = maxpos;
        /* Interpolation is parabolic interpolation. It helps with precision.
         We suppose that a parabola pass through the three points that comprise the peak.
         'a' and 'b' are the unknowns from the linear equation system
         and b/(2a) is the "error" in the abscissa.
         y1,y2,y3 are the ordinates.*/
        var y1 = calcSub[T0 - 1], y2 = calcSub[T0], y3 = calcSub[T0 + 1];
        var a = (y1 + y3 - 2 * y2) / 2;
        var b = (y3 - y1) / 2;
        if (a)
            T0 = T0 - b / (2 * a);
        return sampleRate / T0;
    };
}
exports.ACF2PLUS = ACF2PLUS;

},{}],2:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_AMDF_PARAMS = {
    sampleRate: 44100,
    minFrequency: 82,
    maxFrequency: 1000,
    ratio: 5,
    sensitivity: 0.1,
};
function AMDF(params) {
    if (params === void 0) { params = {}; }
    var config = __assign(__assign({}, DEFAULT_AMDF_PARAMS), params);
    var sampleRate = config.sampleRate;
    var minFrequency = config.minFrequency;
    var maxFrequency = config.maxFrequency;
    var sensitivity = config.sensitivity;
    var ratio = config.ratio;
    var amd = [];
    /* Round in such a way that both exact minPeriod as
     exact maxPeriod lie inside the rounded span minPeriod-maxPeriod,
     thus ensuring that minFrequency and maxFrequency can be found
     even in edge cases */
    var maxPeriod = Math.ceil(sampleRate / minFrequency);
    var minPeriod = Math.floor(sampleRate / maxFrequency);
    return function AMDFDetector(float32AudioBuffer) {
        var maxShift = float32AudioBuffer.length;
        var t = 0;
        var minval = Infinity;
        var maxval = -Infinity;
        var frames1, frames2, calcSub, i, j, u, aux1, aux2;
        // Find the average magnitude difference for each possible period offset.
        for (i = 0; i < maxShift; i++) {
            if (minPeriod <= i && i <= maxPeriod) {
                for (aux1 = 0, aux2 = i, t = 0, frames1 = [], frames2 = []; aux1 < maxShift - i; t++, aux2++, aux1++) {
                    frames1[t] = float32AudioBuffer[aux1];
                    frames2[t] = float32AudioBuffer[aux2];
                }
                // Take the difference between these frames.
                var frameLength = frames1.length;
                calcSub = [];
                for (u = 0; u < frameLength; u++) {
                    calcSub[u] = frames1[u] - frames2[u];
                }
                // Sum the differences.
                var summation = 0;
                for (u = 0; u < frameLength; u++) {
                    summation += Math.abs(calcSub[u]);
                }
                amd[i] = summation;
            }
        }
        for (j = minPeriod; j < maxPeriod; j++) {
            if (amd[j] < minval)
                minval = amd[j];
            if (amd[j] > maxval)
                maxval = amd[j];
        }
        var cutoff = Math.round(sensitivity * (maxval - minval) + minval);
        for (j = minPeriod; j <= maxPeriod && amd[j] > cutoff; j++)
            ;
        var searchLength = minPeriod / 2;
        minval = amd[j];
        var minpos = j;
        for (i = j - 1; i < j + searchLength && i <= maxPeriod; i++) {
            if (amd[i] < minval) {
                minval = amd[i];
                minpos = i;
            }
        }
        if (Math.round(amd[minpos] * ratio) < maxval) {
            return sampleRate / minpos;
        }
        else {
            return null;
        }
    };
}
exports.AMDF = AMDF;

},{}],3:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var MAX_FLWT_LEVELS = 6;
var MAX_F = 3000;
var DIFFERENCE_LEVELS_N = 3;
var MAXIMA_THRESHOLD_RATIO = 0.75;
var DEFAULT_DYNAMIC_WAVELET_CONFIG = {
    sampleRate: 44100,
};
function DynamicWavelet(params) {
    if (params === void 0) { params = {}; }
    var config = __assign(__assign({}, DEFAULT_DYNAMIC_WAVELET_CONFIG), params);
    var sampleRate = config.sampleRate;
    return function DynamicWaveletDetector(float32AudioBuffer) {
        var mins = [];
        var maxs = [];
        var bufferLength = float32AudioBuffer.length;
        var freq = null;
        var theDC = 0;
        var minValue = 0;
        var maxValue = 0;
        // Compute max amplitude, amplitude threshold, and the DC.
        for (var i = 0; i < bufferLength; i++) {
            var sample = float32AudioBuffer[i];
            theDC = theDC + sample;
            maxValue = Math.max(maxValue, sample);
            minValue = Math.min(minValue, sample);
        }
        theDC /= bufferLength;
        minValue -= theDC;
        maxValue -= theDC;
        var amplitudeMax = maxValue > -1 * minValue ? maxValue : -1 * minValue;
        var amplitudeThreshold = amplitudeMax * MAXIMA_THRESHOLD_RATIO;
        // levels, start without downsampling...
        var curLevel = 0;
        var curModeDistance = -1;
        var curSamNb = float32AudioBuffer.length;
        var delta, nbMaxs, nbMins;
        // Search:
        while (true) {
            delta = ~~(sampleRate / (Math.pow(2, curLevel) * MAX_F));
            if (curSamNb < 2)
                break;
            var dv = void 0;
            var previousDV = -1000;
            var lastMinIndex = -1000000;
            var lastMaxIndex = -1000000;
            var findMax = false;
            var findMin = false;
            nbMins = 0;
            nbMaxs = 0;
            for (var i = 2; i < curSamNb; i++) {
                var si = float32AudioBuffer[i] - theDC;
                var si1 = float32AudioBuffer[i - 1] - theDC;
                if (si1 <= 0 && si > 0)
                    findMax = true;
                if (si1 >= 0 && si < 0)
                    findMin = true;
                // min or max ?
                dv = si - si1;
                if (previousDV > -1000) {
                    if (findMin && previousDV < 0 && dv >= 0) {
                        // minimum
                        if (Math.abs(si) >= amplitudeThreshold) {
                            if (i > lastMinIndex + delta) {
                                mins[nbMins++] = i;
                                lastMinIndex = i;
                                findMin = false;
                            }
                        }
                    }
                    if (findMax && previousDV > 0 && dv <= 0) {
                        // maximum
                        if (Math.abs(si) >= amplitudeThreshold) {
                            if (i > lastMaxIndex + delta) {
                                maxs[nbMaxs++] = i;
                                lastMaxIndex = i;
                                findMax = false;
                            }
                        }
                    }
                }
                previousDV = dv;
            }
            if (nbMins === 0 && nbMaxs === 0) {
                // No best distance found!
                break;
            }
            var d = void 0;
            var distances = [];
            for (var i = 0; i < curSamNb; i++) {
                distances[i] = 0;
            }
            for (var i = 0; i < nbMins; i++) {
                for (var j = 1; j < DIFFERENCE_LEVELS_N; j++) {
                    if (i + j < nbMins) {
                        d = Math.abs(mins[i] - mins[i + j]);
                        distances[d] += 1;
                    }
                }
            }
            var bestDistance = -1;
            var bestValue = -1;
            for (var i = 0; i < curSamNb; i++) {
                var summed = 0;
                for (var j = -1 * delta; j <= delta; j++) {
                    if (i + j >= 0 && i + j < curSamNb) {
                        summed += distances[i + j];
                    }
                }
                if (summed === bestValue) {
                    if (i === 2 * bestDistance) {
                        bestDistance = i;
                    }
                }
                else if (summed > bestValue) {
                    bestValue = summed;
                    bestDistance = i;
                }
            }
            // averaging
            var distAvg = 0;
            var nbDists = 0;
            for (var j = -delta; j <= delta; j++) {
                if (bestDistance + j >= 0 && bestDistance + j < bufferLength) {
                    var nbDist = distances[bestDistance + j];
                    if (nbDist > 0) {
                        nbDists += nbDist;
                        distAvg += (bestDistance + j) * nbDist;
                    }
                }
            }
            // This is our mode distance.
            distAvg /= nbDists;
            // Continue the levels?
            if (curModeDistance > -1) {
                if (Math.abs(distAvg * 2 - curModeDistance) <= 2 * delta) {
                    // two consecutive similar mode distances : ok !
                    freq = sampleRate / (Math.pow(2, curLevel - 1) * curModeDistance);
                    break;
                }
            }
            // not similar, continue next level;
            curModeDistance = distAvg;
            curLevel++;
            if (curLevel >= MAX_FLWT_LEVELS || curSamNb < 2) {
                break;
            }
            //do not modify original audio buffer, make a copy buffer, if
            //downsampling is needed (only once).
            var newFloat32AudioBuffer = float32AudioBuffer.subarray(0);
            if (curSamNb === distances.length) {
                newFloat32AudioBuffer = new Float32Array(curSamNb / 2);
            }
            for (var i = 0; i < curSamNb / 2; i++) {
                newFloat32AudioBuffer[i] =
                    (float32AudioBuffer[2 * i] + float32AudioBuffer[2 * i + 1]) / 2;
            }
            float32AudioBuffer = newFloat32AudioBuffer;
            curSamNb /= 2;
        }
        return freq;
    };
}
exports.DynamicWavelet = DynamicWavelet;

},{}],4:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_MACLEOD_PARAMS = {
    bufferSize: 1024,
    cutoff: 0.97,
    sampleRate: 44100,
};
function Macleod(params) {
    if (params === void 0) { params = {}; }
    var config = __assign(__assign({}, DEFAULT_MACLEOD_PARAMS), params);
    var bufferSize = config.bufferSize, cutoff = config.cutoff, sampleRate = config.sampleRate;
    /**
     * For performance reasons, peaks below this cutoff are not even considered.
     */
    var SMALL_CUTOFF = 0.5;
    /**
     * Pitch annotations below this threshold are considered invalid, they are
     * ignored.
     */
    var LOWER_PITCH_CUTOFF = 80;
    /**
     * Contains a normalized square difference function value for each delay
     * (tau).
     */
    var nsdf = new Float32Array(bufferSize);
    /**
     * Contains a sum of squares of the Buffer, for improving performance
     * (avoids redoing math in the normalized square difference function)
     */
    var squaredBufferSum = new Float32Array(bufferSize);
    /**
     * The x and y coordinate of the top of the curve (nsdf).
     */
    var turningPointX;
    var turningPointY;
    /**
     * A list with minimum and maximum values of the nsdf curve.
     */
    var maxPositions = [];
    /**
     * A list of estimates of the period of the signal (in samples).
     */
    var periodEstimates = [];
    /**
     * A list of estimates of the amplitudes corresponding with the period
     * estimates.
     */
    var ampEstimates = [];
    /**
     * Implements the normalized square difference function. See section 4 (and
     * the explanation before) in the MPM article. This calculation can be
     * optimized by using an FFT. The results should remain the same.
     */
    function normalizedSquareDifference(float32AudioBuffer) {
        var acf;
        var divisorM;
        squaredBufferSum[0] = float32AudioBuffer[0] * float32AudioBuffer[0];
        for (var i = 1; i < float32AudioBuffer.length; i += 1) {
            squaredBufferSum[i] =
                float32AudioBuffer[i] * float32AudioBuffer[i] + squaredBufferSum[i - 1];
        }
        for (var tau = 0; tau < float32AudioBuffer.length; tau++) {
            acf = 0;
            divisorM =
                squaredBufferSum[float32AudioBuffer.length - 1 - tau] +
                    squaredBufferSum[float32AudioBuffer.length - 1] -
                    squaredBufferSum[tau];
            for (var i = 0; i < float32AudioBuffer.length - tau; i++) {
                acf += float32AudioBuffer[i] * float32AudioBuffer[i + tau];
            }
            nsdf[tau] = (2 * acf) / divisorM;
        }
    }
    /**
     * Finds the x value corresponding with the peak of a parabola.
     * Interpolates between three consecutive points centered on tau.
     */
    function parabolicInterpolation(tau) {
        var nsdfa = nsdf[tau - 1], nsdfb = nsdf[tau], nsdfc = nsdf[tau + 1], bValue = tau, bottom = nsdfc + nsdfa - 2 * nsdfb;
        if (bottom === 0) {
            turningPointX = bValue;
            turningPointY = nsdfb;
        }
        else {
            var delta = nsdfa - nsdfc;
            turningPointX = bValue + delta / (2 * bottom);
            turningPointY = nsdfb - (delta * delta) / (8 * bottom);
        }
    }
    // Finds the highest value between each pair of positive zero crossings.
    function peakPicking() {
        var pos = 0;
        var curMaxPos = 0;
        // find the first negative zero crossing.
        while (pos < (nsdf.length - 1) / 3 && nsdf[pos] > 0) {
            pos++;
        }
        // loop over all the values below zero.
        while (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
            pos++;
        }
        // can happen if output[0] is NAN
        if (pos == 0) {
            pos = 1;
        }
        while (pos < nsdf.length - 1) {
            if (nsdf[pos] > nsdf[pos - 1] && nsdf[pos] >= nsdf[pos + 1]) {
                if (curMaxPos == 0) {
                    // the first max (between zero crossings)
                    curMaxPos = pos;
                }
                else if (nsdf[pos] > nsdf[curMaxPos]) {
                    // a higher max (between the zero crossings)
                    curMaxPos = pos;
                }
            }
            pos++;
            // a negative zero crossing
            if (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
                // if there was a maximum add it to the list of maxima
                if (curMaxPos > 0) {
                    maxPositions.push(curMaxPos);
                    curMaxPos = 0; // clear the maximum position, so we start
                    // looking for a new ones
                }
                while (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
                    pos++; // loop over all the values below zero
                }
            }
        }
        if (curMaxPos > 0) {
            maxPositions.push(curMaxPos);
        }
    }
    return function Macleod(float32AudioBuffer) {
        // 0. Clear old results.
        var pitch;
        maxPositions = [];
        periodEstimates = [];
        ampEstimates = [];
        // 1. Calculute the normalized square difference for each Tau value.
        normalizedSquareDifference(float32AudioBuffer);
        // 2. Peak picking time: time to pick some peaks.
        peakPicking();
        var highestAmplitude = -Infinity;
        for (var i = 0; i < maxPositions.length; i++) {
            var tau = maxPositions[i];
            // make sure every annotation has a probability attached
            highestAmplitude = Math.max(highestAmplitude, nsdf[tau]);
            if (nsdf[tau] > SMALL_CUTOFF) {
                // calculates turningPointX and Y
                parabolicInterpolation(tau);
                // store the turning points
                ampEstimates.push(turningPointY);
                periodEstimates.push(turningPointX);
                // remember the highest amplitude
                highestAmplitude = Math.max(highestAmplitude, turningPointY);
            }
        }
        if (periodEstimates.length) {
            // use the overall maximum to calculate a cutoff.
            // The cutoff value is based on the highest value and a relative
            // threshold.
            var actualCutoff = cutoff * highestAmplitude;
            var periodIndex = 0;
            for (var i = 0; i < ampEstimates.length; i++) {
                if (ampEstimates[i] >= actualCutoff) {
                    periodIndex = i;
                    break;
                }
            }
            var period = periodEstimates[periodIndex], pitchEstimate = sampleRate / period;
            if (pitchEstimate > LOWER_PITCH_CUTOFF) {
                pitch = pitchEstimate;
            }
            else {
                pitch = -1;
            }
        }
        else {
            // no pitch detected.
            pitch = -1;
        }
        return {
            probability: highestAmplitude,
            freq: pitch,
        };
    };
}
exports.Macleod = Macleod;

},{}],5:[function(require,module,exports){
"use strict";
/*
  Copyright (C) 2003-2009 Paul Brossier <piem@aubio.org>
  This file is part of aubio.
  aubio is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  aubio is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with aubio.  If not, see <http://www.gnu.org/licenses/>.
*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_YIN_PARAMS = {
    threshold: 0.1,
    sampleRate: 44100,
    probabilityThreshold: 0.1,
};
function YIN(params) {
    if (params === void 0) { params = {}; }
    var config = __assign(__assign({}, DEFAULT_YIN_PARAMS), params);
    var threshold = config.threshold, sampleRate = config.sampleRate, probabilityThreshold = config.probabilityThreshold;
    return function YINDetector(float32AudioBuffer) {
        // Set buffer size to the highest power of two below the provided buffer's length.
        var bufferSize;
        for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2)
            ;
        bufferSize /= 2;
        // Set up the yinBuffer as described in step one of the YIN paper.
        var yinBufferLength = bufferSize / 2;
        var yinBuffer = new Float32Array(yinBufferLength);
        var probability = 0, tau;
        // Compute the difference function as described in step 2 of the YIN paper.
        for (var t = 0; t < yinBufferLength; t++) {
            yinBuffer[t] = 0;
        }
        for (var t = 1; t < yinBufferLength; t++) {
            for (var i = 0; i < yinBufferLength; i++) {
                var delta = float32AudioBuffer[i] - float32AudioBuffer[i + t];
                yinBuffer[t] += delta * delta;
            }
        }
        // Compute the cumulative mean normalized difference as described in step 3 of the paper.
        yinBuffer[0] = 1;
        yinBuffer[1] = 1;
        var runningSum = 0;
        for (var t = 1; t < yinBufferLength; t++) {
            runningSum += yinBuffer[t];
            yinBuffer[t] *= t / runningSum;
        }
        // Compute the absolute threshold as described in step 4 of the paper.
        // Since the first two positions in the array are 1,
        // we can start at the third position.
        for (tau = 2; tau < yinBufferLength; tau++) {
            if (yinBuffer[tau] < threshold) {
                while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                // found tau, exit loop and return
                // store the probability
                // From the YIN paper: The threshold determines the list of
                // candidates admitted to the set, and can be interpreted as the
                // proportion of aperiodic power tolerated
                // within a periodic signal.
                //
                // Since we want the periodicity and and not aperiodicity:
                // periodicity = 1 - aperiodicity
                probability = 1 - yinBuffer[tau];
                break;
            }
        }
        // if no pitch found, return null.
        if (tau === yinBufferLength || yinBuffer[tau] >= threshold) {
            return null;
        }
        // If probability too low, return -1.
        if (probability < probabilityThreshold) {
            return null;
        }
        /**
         * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
         * value using parabolic interpolation. This is needed to detect higher
         * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
         * for more background
         * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
         */
        var betterTau, x0, x2;
        if (tau < 1) {
            x0 = tau;
        }
        else {
            x0 = tau - 1;
        }
        if (tau + 1 < yinBufferLength) {
            x2 = tau + 1;
        }
        else {
            x2 = tau;
        }
        if (x0 === tau) {
            if (yinBuffer[tau] <= yinBuffer[x2]) {
                betterTau = tau;
            }
            else {
                betterTau = x2;
            }
        }
        else if (x2 === tau) {
            if (yinBuffer[tau] <= yinBuffer[x0]) {
                betterTau = tau;
            }
            else {
                betterTau = x0;
            }
        }
        else {
            var s0 = yinBuffer[x0];
            var s1 = yinBuffer[tau];
            var s2 = yinBuffer[x2];
            // fixed AUBIO implementation, thanks to Karl Helgason:
            // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
            betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }
        return sampleRate / betterTau;
    };
}
exports.YIN = YIN;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yin_1 = require("./detectors/yin");
exports.YIN = yin_1.YIN;
var amdf_1 = require("./detectors/amdf");
exports.AMDF = amdf_1.AMDF;
var acf2plus_1 = require("./detectors/acf2plus");
exports.ACF2PLUS = acf2plus_1.ACF2PLUS;
var dynamic_wavelet_1 = require("./detectors/dynamic_wavelet");
exports.DynamicWavelet = dynamic_wavelet_1.DynamicWavelet;
var macleod_1 = require("./detectors/macleod");
exports.Macleod = macleod_1.Macleod;
var frequencies_1 = require("./tools/frequencies");
exports.frequencies = frequencies_1.frequencies;
exports.default = {
    YIN: yin_1.YIN,
    AMDF: amdf_1.AMDF,
    ACF2PLUS: acf2plus_1.ACF2PLUS,
    DynamicWavelet: dynamic_wavelet_1.DynamicWavelet,
    Macleod: macleod_1.Macleod,
    frequencies: frequencies_1.frequencies,
};

},{"./detectors/acf2plus":1,"./detectors/amdf":2,"./detectors/dynamic_wavelet":3,"./detectors/macleod":4,"./detectors/yin":5,"./tools/frequencies":7}],7:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FREQUENCIES_PARAMS = {
    tempo: 120,
    quantization: 4,
    sampleRate: 44100,
};
function pitchConsensus(detectors, chunk) {
    var pitches = detectors
        .map(function (fn) { return fn(chunk); })
        .filter(function (value) { return value !== null; })
        .sort(function (a, b) { return a - b; });
    // In the case of one pitch, return it.
    if (pitches.length === 1) {
        return pitches[0];
        // In the case of two pitches, return the geometric mean if they
        // are close to each other, and the lower pitch otherwise.
    }
    else if (pitches.length === 2) {
        var first = pitches[0], second = pitches[1];
        return first * 2 > second ? Math.sqrt(first * second) : first;
        // In the case of three or more pitches, filter away the extremes
        // if they are very extreme, then take the geometric mean.
    }
    else {
        var first = pitches[0];
        var second = pitches[1];
        var secondToLast = pitches[pitches.length - 2];
        var last = pitches[pitches.length - 1];
        var filtered1 = first * 2 > second ? pitches : pitches.slice(1);
        var filtered2 = secondToLast * 2 > last ? filtered1 : filtered1.slice(0, -1);
        return Math.pow(filtered2.reduce(function (t, p) { return t * p; }, 1), 1 / filtered2.length);
    }
}
function frequencies(detector, float32AudioBuffer, options) {
    if (options === void 0) { options = {}; }
    var config = __assign(__assign({}, exports.DEFAULT_FREQUENCIES_PARAMS), options);
    var tempo = config.tempo, quantization = config.quantization, sampleRate = config.sampleRate;
    var bufferLength = float32AudioBuffer.length;
    var chunkSize = Math.round((sampleRate * 60) / (quantization * tempo));
    var getPitch;
    if (Array.isArray(detector)) {
        getPitch = pitchConsensus.bind(null, detector);
    }
    else {
        getPitch = detector;
    }
    var pitches = [];
    for (var i = 0, max = bufferLength - chunkSize; i <= max; i += chunkSize) {
        var chunk = float32AudioBuffer.slice(i, i + chunkSize);
        var pitch = getPitch(chunk);
        pitches.push(pitch);
    }
    return pitches;
}
exports.frequencies = frequencies;

},{}],8:[function(require,module,exports){
(function (global){(function (){
"use strict";

var formats = {
  0x0001: "lpcm",
  0x0003: "lpcm"
};

function decodeSync(buffer, opts) {
  opts = opts || {};

  if (global.Buffer && buffer instanceof global.Buffer) {
    buffer = Uint8Array.from(buffer).buffer;
  }

  var dataView = new DataView(buffer);
  var reader = createReader(dataView);

  if (reader.string(4) !== "RIFF") {
    throw new TypeError("Invalid WAV file");
  }

  reader.uint32(); // skip file length

  if (reader.string(4) !== "WAVE") {
    throw new TypeError("Invalid WAV file");
  }

  var format = null;
  var audioData = null;

  do {
    var chunkType = reader.string(4);
    var chunkSize = reader.uint32();

    switch (chunkType) {
    case "fmt ":
      format = decodeFormat(reader, chunkSize);
      if (format instanceof Error) {
        throw format;
      }
      break;
    case "data":
      audioData = decodeData(reader, chunkSize, format, opts);
      if (audioData instanceof Error) {
        throw audioData;
      }
      break;
    default:
      reader.skip(chunkSize);
      break;
    }
  } while (audioData === null);

  return audioData;
}

function decode(buffer, opts) {
  return new Promise(function(resolve) {
    resolve(decodeSync(buffer, opts));
  });
}

function decodeFormat(reader, chunkSize) {
  var formatId = reader.uint16();

  if (!formats.hasOwnProperty(formatId)) {
    return new TypeError("Unsupported format in WAV file: 0x" + formatId.toString(16));
  }

  var format = {
    formatId: formatId,
    floatingPoint: formatId === 0x0003,
    numberOfChannels: reader.uint16(),
    sampleRate: reader.uint32(),
    byteRate: reader.uint32(),
    blockSize: reader.uint16(),
    bitDepth: reader.uint16()
  };
  reader.skip(chunkSize - 16);

  return format;
}

function decodeData(reader, chunkSize, format, opts) {
  chunkSize = Math.min(chunkSize, reader.remain());

  var length = Math.floor(chunkSize / format.blockSize);
  var numberOfChannels = format.numberOfChannels;
  var sampleRate = format.sampleRate;
  var channelData = new Array(numberOfChannels);

  for (var ch = 0; ch < numberOfChannels; ch++) {
    channelData[ch] = new Float32Array(length);
  }

  var retVal = readPCM(reader, channelData, length, format, opts);

  if (retVal instanceof Error) {
    return retVal;
  }

  return {
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
    channelData: channelData
  };
}

function readPCM(reader, channelData, length, format, opts) {
  var bitDepth = format.bitDepth;
  var decoderOption = format.floatingPoint ? "f" : opts.symmetric ? "s" : "";
  var methodName = "pcm" + bitDepth + decoderOption;

  if (!reader[methodName]) {
    return new TypeError("Not supported bit depth: " + format.bitDepth);
  }

  var read = reader[methodName].bind(reader);
  var numberOfChannels = format.numberOfChannels;

  for (var i = 0; i < length; i++) {
    for (var ch = 0; ch < numberOfChannels; ch++) {
      channelData[ch][i] = read();
    }
  }

  return null;
}

function createReader(dataView) {
  var pos = 0;

  return {
    remain: function() {
      return dataView.byteLength - pos;
    },
    skip: function(n) {
      pos += n;
    },
    uint8: function() {
      var data = dataView.getUint8(pos, true);

      pos += 1;

      return data;
    },
    int16: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data;
    },
    uint16: function() {
      var data = dataView.getUint16(pos, true);

      pos += 2;

      return data;
    },
    uint32: function() {
      var data = dataView.getUint32(pos, true);

      pos += 4;

      return data;
    },
    string: function(n) {
      var data = "";

      for (var i = 0; i < n; i++) {
        data += String.fromCharCode(this.uint8());
      }

      return data;
    },
    pcm8: function() {
      var data = dataView.getUint8(pos) - 128;

      pos += 1;

      return data < 0 ? data / 128 : data / 127;
    },
    pcm8s: function() {
      var data = dataView.getUint8(pos) - 127.5;

      pos += 1;

      return data / 127.5;
    },
    pcm16: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data < 0 ? data / 32768 : data / 32767;
    },
    pcm16s: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data / 32768;
    },
    pcm24: function() {
      var x0 = dataView.getUint8(pos + 0);
      var x1 = dataView.getUint8(pos + 1);
      var x2 = dataView.getUint8(pos + 2);
      var xx = (x0 + (x1 << 8) + (x2 << 16));
      var data = xx > 0x800000 ? xx - 0x1000000 : xx;

      pos += 3;

      return data < 0 ? data / 8388608 : data / 8388607;
    },
    pcm24s: function() {
      var x0 = dataView.getUint8(pos + 0);
      var x1 = dataView.getUint8(pos + 1);
      var x2 = dataView.getUint8(pos + 2);
      var xx = (x0 + (x1 << 8) + (x2 << 16));
      var data = xx > 0x800000 ? xx - 0x1000000 : xx;

      pos += 3;

      return data / 8388608;
    },
    pcm32: function() {
      var data = dataView.getInt32(pos, true);

      pos += 4;

      return data < 0 ? data / 2147483648 : data / 2147483647;
    },
    pcm32s: function() {
      var data = dataView.getInt32(pos, true);

      pos += 4;

      return data / 2147483648;
    },
    pcm32f: function() {
      var data = dataView.getFloat32(pos, true);

      pos += 4;

      return data;
    },
    pcm64f: function() {
      var data = dataView.getFloat64(pos, true);

      pos += 8;

      return data;
    }
  };
}

module.exports.decode = decode;
module.exports.decode.sync = decodeSync;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
const Pitchfinder = require('pitchfinder');
const WavDecoder = require('wav-decoder');

const detectPitch = new Pitchfinder.YIN();

// A0
const lowestFreq = 27.5;
// A9
const highestFreq = 14080;

let tempo = 60;
const minTempo = 30;
const maxTempo = 252;

const noteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

// Set up the canvas
// const canvas = document.getElementById('metronome');
// const context = canvas.getContext('2d');

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyserNode = audioCtx.createAnalyser()
let metronomeOn = false;
const noteDisplay = document.getElementById('note');
const tempoDisplay = document.getElementById('tempo');
const hand = document.getElementById('hand')

window.tune = async () => {
    try {
        metronomeOn = false;
        const stream = await navigator.mediaDevices.getUserMedia ({audio: true})

        let microphoneStream = audioCtx.createMediaStreamSource(stream);
        microphoneStream.connect(analyserNode);

        audioData = new Float32Array(analyserNode.fftSize);
        corrolatedSignal = new Float32Array(analyserNode.fftSize);

        setInterval(() => {
            analyserNode.getFloatTimeDomainData(audioData);

            const sigSounds = audioData.filter((d) => Math.abs(d) > 0.015);
            if (sigSounds.length < 1) return;

            let pitch = detectPitch(WavDecoder.decode(audioData).channelData[0]);
            console.log(pitch)

            if (Number.isNaN(pitch) || pitch < lowestFreq || pitch > highestFreq ) return;

            const relNote = Math.log2(pitch / lowestFreq) * 12;

            const index = Math.round(relNote) % 12;

            const note = noteNames[index];

            let rotate = 45 * (relNote - Math.round(relNote));

            console.log(rotate)

            const currRotation = hand.style.transform.match(/rotate\((.+)\)/);

            if (currRotation) {
                const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

                // plus degree because wole metronome is shifted -45deg
                rotate = Math.abs(rotate + currDeg);
            }

            noteDisplay.innerHTML = `${note}`;

            hand.style.transform = `rotate(${rotate}deg)`;
        }, 600);
    } catch(err) {
        console.log(err);
    };
}


const tap = () => {
    if (metronomeOn) return;
    metronomeOn = true;
    // first rotate all the way right
    const currRotation = hand.style.transform.match(/rotate\((.+)\)/);

    if (currRotation) {
        const currDeg = currRotation.slice(1)[0].replace(/deg$/, '');

        hand.style.transform = `rotate(${ - currDeg}deg)`;
    }

    // then oscilate between left and right
    let rotate = -45;
    const met = setInterval(() => {
        hand.style.transform = `rotate(${-45 + rotate}deg)`;
        rotate *= -1;
        // play sound
        if (!metronomeOn) clearInterval(met);
    }, (60 / tempo) * 1000);
}


const increaseTempo = () => {
    const inc = Math.floor(tempo / 20);
    if (tempo + inc > maxTempo) tempo = minTempo;
    else tempo += inc;
    hand.style.transitionDuration = `${60 / tempo}s`;
    tempoDisplay.innerHTML = `${tempo}`;
}

const decreaseTempo = () => {
    const dec = Math.floor(tempo / 20);
    if (tempo + dec > minTempo) tempo = maxTempo;
    else tempo -= dec;
    hand.style.transitionDuration = `${60 / tempo}s`;
    tempoDisplay.innerHTML = `${tempo}`;
}


const playNote = () => {

}

const toggleLight = () => {

}

module.exports = {
    tune,
    tap
}
},{"pitchfinder":6,"wav-decoder":8}]},{},[9]);
