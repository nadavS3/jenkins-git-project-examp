import { makeObservable, observable, computed, action, reaction } from 'mobx';
import { millisToMinutesAndSeconds, TimeToDateFilter } from '../consts/functions'
import { AsyncTools } from '@hilma/tools';
import Axios from 'axios';
import { TIMES } from '../consts/consts';
import { SuperAdminStoreInstance } from './index.store';

export class statisticsPageStore {
    superAdminStore = SuperAdminStoreInstance;

    statisticsPageData = {
        finished: {
            total: 0,
            men: 0,
            women: 0,
            other: 0
        },
        unfinished: 0,
        avgTotalDuration: 0, // in millisec
        levelGood: {
            total: 0,
            men: 0,
            women: 0,
            other: 0
        },
        levelBad: {
            total: 0,
            men: 0,
            women: 0,
            other: 0
        },
        categoriesStats: [], // in each: categoryName, totalAnswers, correctAnswers // ? to be changed, depend on ifiun
        ageRangesStats: [], // in each: range:{low,high}, numberOfGood, numberOfBad
        sectorsStats: [], // in each: sectorName, amount
        organizationsStats: [], // in each: organizationName, amount
        limitedCitiesStats: [], // in each: cityName, numberOfGood, numberOfBad
        limitedQuestionsStats: [], // in each: questionNumber, numberOfCorrect, numberOfIncorrect
    };
    allQuestionsData = []
    allCitiesData = []

    dataIsLoading = false;
    filters = {
        dateRange: TIMES[0],
    };

    constructor() {
        makeObservable(this, {
            statisticsPageData: observable,
            allQuestionsData: observable,
            allCitiesData: observable,
            dataIsLoading: observable,
            filters: observable,

            getFinishedData: computed,
            getNumberOfUnfinished: computed,
            getAvgTotalDurationData: computed,
            getLevelGoodData: computed,
            getLevelBadData: computed,
            getCategoriesData: computed,
            getAgeRangesData: computed,
            getSectorsStats: computed,
            getOrganizationsStats: computed,

            setAllQuestionsData: action,
            setStatisticsPageData: action,
            setAllCitiesData: action,
            setDataIsLoading: action,
            setFilters: action,
        });

        reaction(() => this.filters, () => {
            if (this.filters.questionnaireId) {
                const filtersForFetch = this.setFiltersForFetch();
                this.fetchStatistics(filtersForFetch);
            }
        });

    }

    setAllCitiesData(data) {
        this.allCitiesData = data;
    }
    setAllQuestionsData(data) {
        this.allQuestionsData = data;
    }
    setDataIsLoading(bool) {
        this.dataIsLoading = bool;
    }
    setFilters(addFilters) { // array, in each filter: name, value
        let prevFilters = { ...this.filters };
        for (const filter of addFilters) { prevFilters[filter.name] = filter.value; }
        this.filters = prevFilters;
    }

    get getFinishedData() {
        if (this.statisticsPageData && this.statisticsPageData.finished) {
            const total = this.statisticsPageData.finished.total;
            const menPercentage = (this.statisticsPageData.finished.men / this.statisticsPageData.finished.total) * 100;
            const womenPercentage = (this.statisticsPageData.finished.women / this.statisticsPageData.finished.total) * 100;
            const otherPercentage = (this.statisticsPageData.finished.other / this.statisticsPageData.finished.total) * 100;
            return { total: total, dataForChart: [{ gender: "women", percentage: womenPercentage }, { gender: "men", percentage: menPercentage }, { gender: "other", percentage: otherPercentage }] }
        }
        return null;
    }
    get getNumberOfUnfinished() {
        if (this.statisticsPageData) {
            return this.statisticsPageData.unfinished;
        }
        return null;
    }
    get getAvgTotalDurationData() {
        if (this.statisticsPageData) {
            if (!this.statisticsPageData.avgTotalDuration) {
                return false;
            }
            const stringTime = millisToMinutesAndSeconds(this.statisticsPageData.avgTotalDuration);
            return stringTime;
        }
        return null;
    }
    get getLevelGoodData() {
        if (this.statisticsPageData && this.statisticsPageData.levelGood) {
            const total = this.statisticsPageData.levelGood.total;
            const menPercentage = (this.statisticsPageData.levelGood.men / this.statisticsPageData.levelGood.total) * 100;
            const womenPercentage = (this.statisticsPageData.levelGood.women / this.statisticsPageData.levelGood.total) * 100;
            const otherPercentage = (this.statisticsPageData.levelGood.other / this.statisticsPageData.levelGood.total) * 100;
            return { total: total, menPercentage: menPercentage, womenPercentage: womenPercentage, otherPercentage: otherPercentage }
        }
        return null;
    }
    get getLevelBadData() {
        if (this.statisticsPageData && this.statisticsPageData.levelBad) {
            const total = this.statisticsPageData.levelBad.total;
            const menPercentage = (this.statisticsPageData.levelBad.men / this.statisticsPageData.levelBad.total) * 100;
            const womenPercentage = (this.statisticsPageData.levelBad.women / this.statisticsPageData.levelBad.total) * 100;
            const otherPercentage = (this.statisticsPageData.levelBad.other / this.statisticsPageData.levelBad.total) * 100;
            return { total: total, menPercentage: menPercentage, womenPercentage: womenPercentage, otherPercentage: otherPercentage }
        }
        return null;
    }
    get getCategoriesData() {
        if (this.statisticsPageData && this.statisticsPageData.categoriesStats) {
            let data = [];
            this.statisticsPageData.categoriesStats.forEach((cat) => {
                const successRate = Math.round((cat.correct / cat.total) * 100);
                const failRate = 100 - successRate;
                const rates = [{ result: "success", rate: successRate }, { result: "fail", rate: failRate }];
                data.push({ categoryName: cat.categoryName, rates: rates, ...cat });
            })
            return data;
        }
        return null;
    }
    get getAgeRangesData() {
        if (this.statisticsPageData && this.statisticsPageData.ageRangesStats && this.statisticsPageData.ageRangesStats !== []) {
            const goodDataExist = (this.statisticsPageData.levelGood.total > 0);
            const badDataExist = (this.statisticsPageData.levelBad.total > 0);
            if (!goodDataExist && !badDataExist) { return { goodDataExist: goodDataExist, badDataExist: badDataExist } }
            let goodData = [];
            let badData = [];
            let ranges = [];
            this.statisticsPageData.ageRangesStats.forEach((range) => {
                const goodLevelPercentage = (range.numberOfGood / this.statisticsPageData.levelGood.total) * 100;
                const badLevelPercentage = (range.numberOfBad / this.statisticsPageData.levelBad.total) * 100;
                const rangeInString = (range.range.high - range.range.low < 30) ? `${range.range.low}-${range.range.high}` : `${range.range.low}+`
                // to make 51-200 => 51+
                goodData.push({ range: rangeInString, percentage: goodLevelPercentage });
                badData.push({ range: rangeInString, percentage: badLevelPercentage });
                ranges.push(rangeInString);
            })
            return { ranges: ranges, goodDataExist: goodDataExist, badDataExist: badDataExist, goodDataForChart: goodData, badDataForChart: badData };
        }
        return null;
    }
    get getSectorsStats() {
        if (this.statisticsPageData && this.statisticsPageData.sectorsStats && this.statisticsPageData.sectorsStats !== []) {
            const maxCount = Math.max.apply(Math, this.statisticsPageData.sectorsStats.map(function (s) { return s.count; })); // max value
            return { array: this.statisticsPageData.sectorsStats, maxCount: maxCount };
        }
        return null;
    }
    get getOrganizationsStats() {
        if (this.statisticsPageData && this.statisticsPageData.organizationsStats && this.statisticsPageData.organizationsStats !== []) {
            const maxCount = Math.max.apply(Math, this.statisticsPageData.organizationsStats.map(function (o) { return o.count; })); // max value
            return { array: this.statisticsPageData.organizationsStats, maxCount: maxCount };
        }
        return null;
    }
    get getLimitedCitiesStats() {
        if (this.statisticsPageData && this.statisticsPageData.limitedCitiesStats && this.statisticsPageData.limitedCitiesStats !== []) {
            let dataForTable = [];
            this.statisticsPageData.limitedCitiesStats.forEach((city) => {
                dataForTable.push({ value: city.city, good: city.GOOD, intermediate: city.INTERMEDIATE, bad: city.BAD }); // should be exect as questions for generic table
            })
            return dataForTable;
        }
        return null;
    }
    get getLimitedQuestionsStats() {
        if (this.statisticsPageData && this.statisticsPageData.limitedQuestionsStats && this.statisticsPageData.limitedQuestionsStats !== []) {
            let dataForTable = [];
            this.statisticsPageData.limitedQuestionsStats.forEach((q, i) => {
                dataForTable.push({ value: `שאלה ${i + 1}`, good: q.correct, bad: q.incorrect }); // should be exect as cities for generic table
            })
            return dataForTable;
        }
        return null;
    }

    setFiltersForFetch() {
        let filtersForFetch = {};
        if (this.filters.questionnaireId !== undefined) {
            filtersForFetch.questionnaireId = this.superAdminStore.questionnairesAndIds.find(q => q.title === this.filters.questionnaireId)._id;
        }
        if (this.filters.organizationId !== undefined) {
            filtersForFetch.organizationId = this.superAdminStore.organizationsForFilterIncludeAll.find(org => org.organizationName === this.filters.organizationId)._id;
        }
        if (this.filters.dateRange) {
            filtersForFetch.dateRange = TimeToDateFilter(this.filters.dateRange);
        }
        return filtersForFetch;
    }

    async fetchStatistics(filtersForFetch) {
        this.setDataIsLoading(true);
        const [err, res] = await AsyncTools.to(Axios.post(`api/admin/all-statistics`, { filters: filtersForFetch }));
        if (res) {
            this.setStatisticsPageData(res.data);
            this.setDataIsLoading(false);
        }
        else {
            this.setDataIsLoading(false);
            throw err;
            // ! add error handling
        }
    }

    async fetchAllQuestionsData() {
        const filtersForFetch = this.setFiltersForFetch();
        const [err, res] = await AsyncTools.to(Axios.post(`api/admin/all-questions-statistics`, { filters: filtersForFetch }));
        if (res) { this.setAllQuestionsData(res.data); return true; }
        else { throw err; }
    }

    async fetchAllCitiesStats() {
        const filtersForFetch = this.setFiltersForFetch();
        const [err, res] = await AsyncTools.to(Axios.post(`api/admin/all-cities-statistics`, { filters: filtersForFetch }));
        if (res) { this.setAllCitiesData(res.data); return true; }
        else { throw err; }
    }

    setStatisticsPageData(data) {
        const { finished, unfinished, avgTotalDuration, levelGood, levelBad, categoriesStats, ageRangesStats, sectorsStats, organizationsStats, limitedCitiesStats, limitedQuestionsStats } = data;
        this.statisticsPageData = {
            finished: finished,
            unfinished: unfinished,
            avgTotalDuration: avgTotalDuration,
            levelGood: levelGood,
            levelBad: levelBad,
            categoriesStats: categoriesStats,
            ageRangesStats: ageRangesStats,
            sectorsStats: sectorsStats,
            organizationsStats: organizationsStats,
            limitedCitiesStats: limitedCitiesStats,
            limitedQuestionsStats: limitedQuestionsStats
        }
    }
}