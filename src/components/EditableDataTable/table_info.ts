export const Translate: Record<string, Record<string, string>> = {
    students: {
        id: "行",
        campus_name: "办学点名称",
        school_class_id: "班级",
        student_id: "学号",
        certificate_type_id: "证件类型",
        certificate_number: "证件号码",
        name: "姓名",
        gender_id: "性别",
        birthday: "出生日期",
        ethnic_group_id: "民族",
        phone: "联系电话",
        bank_name: "开户银行名称",
        bank_account: "银行卡号",
        previous_education_level_id: "以前学历",
        student_origin_id: "生源地",
        student_category_id: "学生类别",
        political_status_id: "政治面貌",
        household_type_id: "户口性质",
        household_area_id: "户口区域",
        household_address: "户籍所在地",
        household_province_id: "户籍所在地-省",
        household_city_id: "户籍所在地-市",
        household_county_id: "户籍所在地-县",
        is_overseas_chinese: "是否三侨生",
        admission_year: "入学年份",
        enrollment_quarter_id: "招生季度",
        major_code: "专业代码",
        training_level_id: "培养层次",
        education_system_id: "学制",
        admission_time: "入学时间",
        student_status_id: "学生状态",
        study_mode_id: "学习形式",
        family_contact_name: "家庭联系人姓名",
        family_contact_phone: "家庭联系人电话",
        family_address: "家庭地址",
        postal_code: "邮编",
        hobby: "兴趣爱好",
        award_situation: "获奖情况",
        old_army: "原部队",
        original_rank_id: "原军衔",
        military_base: "入伍地",
        enlistment_time: "入伍时间",
        retirement_time: "退伍时间",
        retire_type_id: "退役方式",
        health_status_id: "健康状况",
        national_student_id: "全国学籍号",
        is_guangdong_technical_school_graduation: "是否广东技校毕业",
        graduation_school: "毕业学校",
        graduation_certificate_number: "入学前毕业证号",
        graduation_major: "入学前毕业专业",
        graduation_skill_level: "入学前技能水平",
        comprehensive_score: "文科综合分",
        science_score: "理科综合分",
        family_annual_income: "家庭年总收入（元）",
        family_per_capita_income: "家庭人均收入（元）",
        family_income_source: "家庭经济来源",
        is_ethnic_minority_below_100k: "是否10万以下民族",
        is_low_income: "是否低保",
        financial_aid_type_id: "资助申请类型",
        is_poor_households: "是否建档立卡",
        father_name: "父亲姓名",
        father_certificate_type_id: "父亲身份证件类别",
        father_certificate_number: "父亲身份证号",
        mother_name: "母亲姓名",
        mother_certificate_type_id: "母亲身份证件类别",
        mother_certificate_number: "母亲身份证号",
        guardian_certificate_type_id: "其他监护人证件类型",
        guardian_certificate_number: "其他监护人身份证号",
        guardian_name: "其他监护人姓名",
        guardian_contact: "其他监护人联系方式",
        remark1: "备注1",
        remark2: "备注2",
        remark3: "备注3",
        remark4: "备注4",
        remark5: "备注5",
        nationality_id: "国籍",
        is_family_difficulty: "是否家庭困难",
        family_difficulty_type_id: "家庭困难类型",
        social_security_card_number: "社保卡号",
        payment_amount: "缴费金额",
        payment_receipt_number: "缴费收款收据单号",
    }, classes: {
        id: "行", name: "班级名称"
    }, household_provinces: {
        id: "行", name: "省名称"
    }, household_cities: {
        id: "行", name: "市名称"
    }, household_counties: {
        id: "行", name: "县名称"
    },
}


export const FieldOrder: Record<string, string[]> = {
    students: ["id", "campus_name", "school_class_id", "student_id", "certificate_type_id", "certificate_number", "name", "gender_id", "birthday", "ethnic_group_id", "phone", "bank_name", "bank_account", "previous_education_level_id", "student_origin_id", "student_category_id", "political_status_id", "household_type_id", "household_area_id", "household_address", "household_province_id", "household_city_id", "household_county_id", "is_overseas_chinese", "admission_year", "enrollment_quarter_id", "major_code", "training_level_id", "education_system_id", "admission_time", "student_status_id", "study_mode_id", "family_contact_name", "family_contact_phone", "family_address", "postal_code", "hobby", "award_situation", "old_army", "original_rank_id", "military_base", "enlistment_time", "retirement_time", "retire_type_id", "health_status_id", "national_student_id", "is_guangdong_technical_school_graduation", "graduation_school", "graduation_certificate_number", "graduation_major", "graduation_skill_level", "comprehensive_score", "science_score", "family_annual_income", "family_per_capita_income", "family_income_source", "is_ethnic_minority_below_100k", "is_low_income", "financial_aid_type_id", "is_poor_households", "father_name", "father_certificate_type_id", "father_certificate_number", "mother_name", "mother_certificate_type_id", "mother_certificate_number", "guardian_certificate_type_id", "guardian_certificate_number", "guardian_name", "guardian_contact", "remark1", "remark2", "remark3", "remark4", "remark5", "nationality_id", "is_family_difficulty", "family_difficulty_type_id", "social_security_card_number", "payment_amount", "payment_receipt_number",],
}


export function getTranslation(tableName: string, fieldName: string) {
    if (!Translate[tableName]) return fieldName
    return Translate[tableName][fieldName] ?? fieldName
}

export function reOrder(tableName: string, order: string[]) {
    return FieldOrder[tableName]
}
