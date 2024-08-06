import { Request, Response } from 'express';
import User from '../models/user';
import ResponseHelper from '../helpers/responseHelper';
import { paginateArray } from '../helpers/paginationHelper';
import { formatData, renameKeys } from '../helpers/dataFormatterHelper';
import { OK, SERVER_GENERAL_ERROR, INVALID_FIELD_FORMAT } from '../helpers/responseCode';
import { Op } from 'sequelize';

// Fungsi untuk membuat pengguna baru
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

// Fungsi untuk mendapatkan daftar pengguna
const getUsers = async (req: Request, res: Response) => {
    try {
        const { limit, page, nama_lengkap, username, start_date, end_date, search_query, search_by, sort_by, sort_direction } = req.query;

        const limitNum = Number(limit) || 10;
        const pageNum = Number(page) || 1;

        const queryOptions: any = {
            where: {},
        };

        // Menambahkan filter berdasarkan parameter permintaan
        if (nama_lengkap) queryOptions.where.nama_lengkap = nama_lengkap;
        if (username) queryOptions.where.username = username;
        if (start_date && end_date) queryOptions.where.created_at = { [Op.between]: [start_date, end_date] };
        if (search_query && search_by) queryOptions.where[search_by as string] = { [Op.like]: `%${search_query}%` };
        if (sort_by) queryOptions.order = [[sort_by, sort_direction || 'asc']];

        const allData = await User.findAll(queryOptions);
        const plainData = allData.map(user => user.get({ plain: true })); // Mengonversi instance Sequelize ke objek biasa
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
            OK,
            'OK'
        );
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

// Fungsi untuk mendapatkan pengguna berdasarkan ID
const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            ResponseHelper.generate(res, INVALID_FIELD_FORMAT, {}, 'Pengguna tidak ditemukan');
            return;
        }
        ResponseHelper.generate(res, OK, { items: user });
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

// Fungsi untuk memperbarui pengguna
const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_lengkap, username, password } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            ResponseHelper.generate(res, INVALID_FIELD_FORMAT, {}, 'Pengguna tidak ditemukan');
            return;
        }
        await user.update({ nama_lengkap, username, password });

        ResponseHelper.generate(res, OK, { items: { nama_lengkap: user.nama_lengkap } });
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

// Fungsi untuk menghapus pengguna
const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            ResponseHelper.generate(res, INVALID_FIELD_FORMAT, {}, 'Pengguna tidak ditemukan');
            return;
        }
        await user.destroy();
        ResponseHelper.generate(res, OK, {}, 'Pengguna berhasil dihapus');
    } catch (error) {
        ResponseHelper.generate(res, SERVER_GENERAL_ERROR, {}, (error as Error).message);
    }
};

export { createUser, getUsers, getUser, updateUser, deleteUser };
