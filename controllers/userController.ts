import { Request, Response } from 'express';
import User from '../models/user';
import ResponseHelper from '../helpers/responseHelper';
import { paginateArray } from '../helpers/paginationHelper';
import { formatData, renameKeys } from '../helpers/dataFormatterHelper';
import { OK, SERVER_GENERAL_ERROR, INVALID_FIELD_FORMAT } from '../helpers/responseCode';
import { Op } from 'sequelize';
const createUser = async (req: Request, res: Response) => {
    try {
        const { nama_lengkap, username, password } = req.body;
        const user = await User.create({ nama_lengkap, username, password });

        const responseData = {
            nama_lengkap: user.nama_lengkap
        };

        ResponseHelper.generate(res, OK, { items: responseData });
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};



const getUsers = async (req: Request, res: Response) => {
    try {
        const { limit, page, nama_lengkap, username, start_date, end_date, search_query, search_by, sort_by, sort_direction } = req.query;

        const limitNum = Number(limit) || 10;
        const pageNum = Number(page) || 1;

        const queryOptions: any = {
            where: {},
        };

        if (nama_lengkap) queryOptions.where.nama_lengkap = nama_lengkap;
        if (username) queryOptions.where.username = username;
        if (start_date && end_date) queryOptions.where.created_at = { [Op.between]: [start_date, end_date] };
        if (search_query && search_by) queryOptions.where[search_by as string] = { [Op.like]: `%${search_query}%` };
        if (sort_by) queryOptions.order = [[sort_by, sort_direction || 'asc']];

        const allData = await User.findAll(queryOptions);
        const plainData = allData.map(user => user.get({ plain: true })); // Convert Sequelize instances to plain objects
        const paginatedResult = paginateArray(plainData, limitNum, pageNum);

        let formattedData = formatData(paginatedResult.data, ['created_at', 'updated_at']);
        const keyMap = { nama_lengkap: 'nama' };
        formattedData = renameKeys(formattedData, keyMap);

        ResponseHelper.paginate(
            res,
            formattedData,
            pageNum,
            paginatedResult.pageCount,
            limitNum,
            paginatedResult.total,
            '200000',
            'OK'
        );
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            ResponseHelper.generate(res, INVALID_FIELD_FORMAT, {}, 'User not found');
            return;
        }
        ResponseHelper.generate(res, OK, user);
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_lengkap, username, password } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            ResponseHelper.generate(res, INVALID_FIELD_FORMAT, {}, 'User not found');
            return;
        }
        await user.update({ nama_lengkap, username, password });
        ResponseHelper.generate(res, OK, user);
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            ResponseHelper.generate(res, INVALID_FIELD_FORMAT, {}, 'User not found');
            return;
        }
        await user.destroy();
        ResponseHelper.generate(res, OK, 'User deleted successfully');
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

export { createUser, getUsers, getUser, updateUser, deleteUser };
